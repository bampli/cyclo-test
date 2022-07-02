FROM node:16.13.1-slim

RUN apt update && \
    apt install -y \
    git \
    ca-certificates \
    default-jre \
    zsh \
    curl \
    wget \
    fonts-powerline

RUN npm install -g npm@8.10.0

#RUN npm install -g npm@8.10.0 webpack webpack-cli

ENV JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"

USER node

WORKDIR /home/node/app

RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v1.1.2/zsh-in-docker.sh)" -- \
    -t https://github.com/romkatv/powerlevel10k \
    -p git \
    -p git-flow \
    -p https://github.com/zdharma-continuum/fast-syntax-highlighting \
    -p https://github.com/zsh-users/zsh-autosuggestions \
    -p https://github.com/zsh-users/zsh-completions \
    -a 'export TERM=xterm-256color'

RUN echo '[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh' >> ~/.zshrc && \
    echo 'HISTFILE=/home/node/zsh/.zsh_history' >> ~/.zshrc

#CMD [ "sh", "-c", "npm install && tail -f /dev/null" ]

CMD ["tail", "-f", "/dev/null"]
