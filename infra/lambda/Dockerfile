# Use AWS Lambda Node.js base image from Docker Hub
FROM amazon/aws-lambda-nodejs:20

# Install tar and xz utilities, then download and install FFmpeg static build
RUN dnf install -y tar xz && \
    curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o /tmp/ffmpeg.tar.xz && \
    tar -xf /tmp/ffmpeg.tar.xz -C /tmp && \
    mv /tmp/ffmpeg-*-amd64-static/ffmpeg /usr/local/bin/ffmpeg && \
    chmod +x /usr/local/bin/ffmpeg && \
    rm -rf /tmp/ffmpeg* && \
    dnf clean all

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Install dependencies in Lambda task root
COPY package.json pnpm-lock.yaml ${LAMBDA_TASK_ROOT}/

# Install production dependencies (allow lockfile update since we changed deps)
RUN cd ${LAMBDA_TASK_ROOT} && pnpm install --prod

# Copy Lambda function code
COPY birdnet-handler.js ${LAMBDA_TASK_ROOT}/
COPY setup-efs.js ${LAMBDA_TASK_ROOT}/

# Set the CMD to your handler
CMD [ "birdnet-handler.handler" ]
