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

> This is already set up in the gitpod, so you won't need it if going that route.

## The Mystery

Something is wrong with our nice shiny webserver serving content at `localhost:3000`...it looks like it's really sluggish, and so it might be a good idea to se if it's experiencing super high traffic.

So first, we need to figure out what interface things are running on:

```
$ for interface in $(ip link show | grep '^[[:digit:]]\+' | awk -F ':' '{print $2}'); do
  sudo timeout 1 tcpdump -i $interface port 3000
  printf "\n\n"
  echo "this interface is $interface"
  printf "\n\n"
done;
```

This should make it very obvious which interface the packets are being sent on. The use of docker compose with a bridge network _inside_ the gitpod (itself running in a container) makes this a bit more complicated than just local running, but our loop will find the correct interface for us, so no worries there!

> the newlines are just to add some whitespace and make it easier to read, once the interface starts sending packets through.

Next, we can run `tcpdump` against that interface and check for packets going to that port (which should show us the same as above, but it's just to confirm).

`sudo tcpdump -i INTERFACE_FROM_ABOVE_OUTPUT dst 3000`

This should show a few different sources.

```
sudo tcpdump dst 3000
```

Then we see where the packets are coming from. This should tell us the noisy process. Then we kill the container at that IP adderss, and like magic, the webserver is responding again. Nice work!
