package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"
)

/*
 - Check which metadata I need.
 - POST handler with metadata + json report body.
 - Azure SDK to write to a bucket
*/

var addr = flag.String("listen", "localhost:8080", "listen address")

func main() {
	flag.Parse()
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)

	err := run(*addr, c)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Server stopped")
}

func run(addr string, c chan os.Signal) error {
	mux := http.NewServeMux()
	mux.Handle("/",
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// TODO: actual functionality
		}),
	)
	srv := &http.Server{
		Addr:              addr,
		Handler:           mux,
		IdleTimeout:       time.Minute,
		ReadHeaderTimeout: 30 * time.Second,
	}

	go func() {
		for {
			if <-c == os.Interrupt {
				_ = srv.Close()
				return
			}
		}
	}()

	fmt.Printf("Listening on %s \n", srv.Addr)
	err := srv.ListenAndServe()

	if err == http.ErrServerClosed {
		err = nil
	}
	return err
}
