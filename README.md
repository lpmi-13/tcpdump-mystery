# Tcp dump mystery

Using `tcpdump` is super cool, but there aren't very many good learning resources involving actually using it to do things. There are lots of blog posts and docs, and you can run it in your own system, but that's usually pretty boring, because there's no reason to actually use it.

In production systems, often times, it can be a handy tool when something goes wrong, so let's make something go wrong locally and see if `tcpdump` can help us find it and fix it!

**DISCLAIMER**
Sometimes, if the system you're working in has very high traffic, or the things you want to capture are very verbose, tcpdump could be unsuitable, as mentioned [here](https://packetpushers.net/masterclass-tcpdump-basics/)

- Be very careful when specifying expressions and try to make them as specific as possible.
- Don’t capture during times of heavy traffic/load.
- If you wish to capture entire packet contents, do a test capture only capturing the default 68Bytes first and make a judgement on whether the system will cope with the full packet content capture.
- Where writing to disk, carefully monitor the size of the file and make sure the host in question has the likely disk resources required available, or use the -c parameter to limit the number of packets captured.
- Never use an expression that would capture traffic to or from your remote telnet/SSH/whatever terminal/shell. tcpdump output would generate traffic to your terminal, resulting in further output, resulting in more traffic to your terminal and so on in an infinite and potentially harmful feedback loop.

...in such cases, a tool like tcpstat might be a better choice.

## Run in Gitpod

You can run this entirely in gitpod if you want.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/lpmi-13/tcpdump-mystery)

## Setup for local runs

You'll need docker and docker-compose for this, so make sure those are installed.

After that, you should be able to run

```
docker-compose --env-file .env.suspects.local up --build
```

> This is already set up in the gitpod, so you won't need it if going that route.

## The Mystery

Something is wrong with our nice shiny webserver serving content at `localhost:3000`...it looks like it's really sluggish, and so it might be a good idea to see if it's experiencing super high traffic.

### Finding our interface

So first, we need to figure out what interface things are running on:

```
$ for interface in $(ip link show | grep '^[[:digit:]]\+' | awk -F ':' '{print $2}'); do
  sudo timeout 1 tcpdump -i $interface port 3000
  printf "\n"
  echo "this interface is $interface"
  printf "\n"
done;
```

> the newlines are just to add some whitespace and make it easier to read, once the interface starts sending packets through. Also, you probably already know that the containers will be using `veth` interfaces, but in other cases, you might not be able to assume that, so this is a good exercise anyway.

You should see one of the interfaces spit out a whole bunch of traffic, and then something like:

```
793 packets captured
818 packets received by filter
25 packets dropped by kernel
Error: no such file "f"
Error: no such file "\n\n"
this interface is br-64b7ac73b79c
```

This should make it very obvious which interface the packets are being sent on. The use of docker compose with a bridge network _inside_ the gitpod (itself running in a container) makes this a bit more complicated than just local running, but our loop will find the correct interface for us, so no worries there!

So it is indeed the bridge interface...but that doesn't help us narrow anything down...

Let's try something a bit different, using the `veth` interfaces directly (since they have weird names with `@` characters, they don't work with our previous attempt:

```
for interface in $(ip link show | grep veth | awk -F ' ' '{print $2}' | awk -F '@' '{print $1}'); do
  sudo timeout 3 tcpdump -nq -i $interface "tcp port 3000" > /dev/null
  printf "\n"
  echo "this interface is $interface"
  printf "\n"
done;
```

You should see some output like:

```
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on veth4123d57, link-type EN10MB (Ethernet), capture size 262144 bytes
82 packets captured
117 packets received by filter
0 packets dropped by kernel

this interface is veth4123d57
```

If you scroll back up through the results (or have sharp eyes), you've probably noticed two very noisy interfaces. One of them will be the main veth for the bridge network...and the other one is going to be our suspect!

### Trace the veth interface to the container

Now we need to find which container is using that interface, which isn't incredibly straightforward, but digging into the containers themselves should tell us. So we can see from the above (eg, `veth62fe590`), that we've isolated the interface sending the traffic.

And if we look in the output of `ip link show` and filter by that interface, we should be able to get the number of the interface mapped to our host.

```
ip link show | grep veth62fe590
```

and we should see something like

```
48: veth62fe590@if47: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master br-64b7ac73b79c state UP mode DEFAULT group default 
```

Great! So the network interface is mapped to `48` in our host. Now we just need to see which container has that number internally at `/sys/class/net/eth0/iflink`...

So starting with the first http-sender container, run this command:

```
docker exec -it 4aae6fcf40d5 cat /sys/class/net/eth0/iflink
```

and you should see the output (we're looking for 48)

```
46
```

Dang...that's not the right one. Keep trying the above command until you find one with the output `48`, and that's our suspect container!

### Arresting the suspect

Now that we've found our container (turns out it was http-sender3 in this case), lets stop it with:

docker stop http-sender3 

And like magic, our web server is nice and responsive again! Great job!

:clapping: :clapping: :clapping:
