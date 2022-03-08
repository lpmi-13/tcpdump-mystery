package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

func main() {

        expressAppUrl := os.Args[1]
	// eventually we'll get this from config to cause the mystery
	concurrentExecutions, _ := strconv.Atoi(os.Args[2])

	ch := make(chan string)

	for i := 0; i < concurrentExecutions; i++ {
		go sendRequest(expressAppUrl, ch)
	}

	for {
		go sendRequest(<-ch, ch)
	}
}

func sendRequest(url string, ch chan string) {
	time.Sleep(300 * time.Millisecond)
	res, err := http.Get(url)
	if err != nil {
		log.Fatalln(err)
	}
	fmt.Println("got status code:", res.StatusCode)

	ch <- url
}
