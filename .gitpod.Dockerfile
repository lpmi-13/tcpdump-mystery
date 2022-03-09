FROM gitpod/workspace-full

RUN sudo apt update -y && sudo apt install -y tcpdump
