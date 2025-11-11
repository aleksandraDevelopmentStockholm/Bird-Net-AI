const { S3Client, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-north-1' });

async function setupEFS() {
  const bucketName = process.env.MODEL_BUCKET_NAME;
  const efsPath = '/mnt/efs';

  if (!bucketName) {
    throw new Error('MODEL_BUCKET_NAME environment variable not set');
  }

  console.log('EFS Setup Lambda invoked');
  console.log(`Bucket: ${bucketName}`);
  console.log(`EFS path: ${efsPath}`);

  // Ensure directories exist
  const targetModelPath = `${efsPath}/models/model-data/model`;
  if (!fs.existsSync(targetModelPath)) {
    console.log(`Creating directory: ${targetModelPath}`);
    fs.mkdirSync(targetModelPath, { recursive: true });
  }

  // Check if files already exist
  const labelsFilePath = `${targetModelPath}/labels.json`;
  if (fs.existsSync(labelsFilePath)) {
    console.log('✅ Model files already exist on EFS');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Model files already exist on EFS', path: targetModelPath }),
    };
  }

  // List all model files from S3
  console.log('Listing files in S3...');
  const listCommand = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: 'model-data/model/',
  });

  const listResponse = await s3.send(listCommand);
  const modelFiles = (listResponse.Contents || []).filter((f) => f.Key && !f.Key.endsWith('/'));

  console.log(`Found ${modelFiles.length} files in S3`);

  // Download each file to EFS
  let copiedCount = 0;
  for (const file of modelFiles) {
    const key = file.Key;
    // Preserve subdirectory structure by removing only the prefix
    const relativePath = key.replace('model-data/model/', '');
    const localPath = path.join(targetModelPath, relativePath);
    const fileName = path.basename(key);

    // Create subdirectories if needed
    const localDir = path.dirname(localPath);
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    if (fs.existsSync(localPath)) {
      console.log(`Skipping ${relativePath} (already exists)`);
      continue;
    }

    console.log(`Downloading ${relativePath} (${(file.Size / 1024 / 1024).toFixed(2)} MB)...`);

    const response = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    fs.writeFileSync(localPath, buffer);
    console.log(`✓ Saved ${relativePath}`);
    copiedCount++;
  }

  console.log(`✅ Copied ${copiedCount} files to EFS`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Model files successfully copied to EFS',
      filesCount: copiedCount,
      path: targetModelPath,
    }),
  };
}

async function clearEFS() {
  const efsPath = '/mnt/efs';
  const targetModelPath = `${efsPath}/models/model-data/model`;

  console.log('Clearing EFS models directory...');

  if (fs.existsSync(targetModelPath)) {
    fs.rmSync(targetModelPath, { recursive: true, force: true });
    console.log(`✅ Cleared ${targetModelPath}`);
  } else {
    console.log('Directory does not exist, nothing to clear');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'EFS cleared successfully' }),
  };
}

exports.handler = async (event) => {
  try {
    // Check if this is a delete/clear request
    if (event.RequestType === 'Delete' || event.action === 'clear') {
      return await clearEFS();
    }

    return await setupEFS();
  } catch (error) {
    console.error('EFS setup failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
    };
  }
};
