# we want to randomize which container is actually the "noisy" one, so this makes sure each run won't just be the same (boring!)
count=1
while read -r line; do
  sed -i "$count s/^/SUSPECT${count}=/" .env.suspects
  (( count++ ))
done < .env.suspects
