# we want to randomize which container is actually the "noisy" one, so this makes sure each run won't just be the same (boring!)
shuf .env.suspects > .env.suspects.tmp && mv .env.suspects.tmp .env.suspects
count=1
while read -r line; do
  sed -i "$count s/^/SUSPECT${count}=/" .env.suspects
  (( count++ ))
done < .env.suspects
