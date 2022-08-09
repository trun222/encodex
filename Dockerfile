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

# Install Doppler for environment variables
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg
RUN curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | apt-key add -
RUN echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list
RUN apt-get update && apt-get install doppler

# Ensure you are in the proper directory
RUN npm ci \
  && npm run build

CMD ["doppler", "run", "--", "node", ".dist/index.js"]