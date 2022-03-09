FROM gitpod/workspace-full

RUN apt update -y && apt install -y tcpdump
