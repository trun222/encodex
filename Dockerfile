FROM ubuntu:20.04
WORKDIR /home/app

COPY . /home/app

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=America/New_York

# install apt-get, curl, and node14
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash 
RUN apt-get install -y nodejs
RUN node --version

# install imageMagick
RUN apt-get install -y imagemagick
RUN mv policy.xml /etc/ImageMagick-6/

# Ensure you are in the proper directory
RUN npm ci \
  && npm run build

CMD ["node", ".dist/index.js"]