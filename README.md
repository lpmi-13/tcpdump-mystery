# Tcp dump mystery

Using `tcpdump` is super cool, but there aren't very many good learning resources involving actually using it to do things. There are lots of blog posts and docs, and you can run it in your own system, but that's usually pretty boring, because there's no reason to actually use it.

In production systems, often times, it can be a handy tool when something goes wrong, so let's make something go wrong locally and see if `tcpdump` can help us find it and fix it!

## Run in Gitpod

You can run this entirely in gitpod if you want.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/lpmi-13/tcpdump-mystery)

## Setup for local runs

You'll need docker and docker-compose for this, so make sure those are installed.

After that, you should be able to run

```
docker-compose up --build
```

## The Mystery

Something is wrong with our nice shiny webserver serving content at `localhost:3000`...it looks like it's really sluggish, and so it might be a good idea to se if it's experiencing super high traffic.

So first, we can run `tcpdump` and check for packets going to that port.

```
sudo tcpdump dst 3000
```

Then we see where the packets are coming from. This should tell us the noisy process. Then we kill the container at that IP adderss, and like magic, the webserver is responding again. Nice work!
