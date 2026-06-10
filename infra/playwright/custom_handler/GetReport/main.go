package main

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
)

func helloHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method == "GET" {
		w.Write([]byte("hello world"))
	} else {
		body, _ := ioutil.ReadAll(r.Body)
		w.Write(body)
	}
}

var (
	accountName = os.Getenv("AZURE_STORAGE_ACCOUNT")
	accountKey  = os.Getenv("AZURE_STORAGE_KEY")
	container   = os.Getenv("AZURE_STORAGE_CONTAINER")
)

func getReportHandler(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/getreport/")

	cred, err := azblob.NewSharedKeyCredential(accountName, accountKey)
	if err != nil {
		http.Error(w, "failed to create credential", http.StatusInternalServerError)
		return
	}

	serviceURL := fmt.Sprintf("https://%s.blob.core.windows.net/", accountName)
	client, err := azblob.NewClientWithSharedKeyCredential(serviceURL, cred, nil)
	if err != nil {
		http.Error(w, "failed to create client", http.StatusInternalServerError)
		return
	}

	resp, err := client.DownloadStream(context.Background(), container, path, nil)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to download blob: %v", err), http.StatusNotFound)
		return
	}
	defer resp.Body.Close()

	ext := filepath.Ext(path)
	contentType := mime.TypeByExtension(ext)

	if contentType == "" {
		contentType = "application/octet-stream"
	}

	w.Header().Set("Content-Type", contentType)
	w.WriteHeader(http.StatusOK)

	_, err = io.Copy(w, resp.Body)
	if err != nil {
		log.Printf("stream error: %v", err)
	}
}

func main() {
	customHandlerPort, exists := os.LookupEnv("FUNCTIONS_CUSTOMHANDLER_PORT")
	if !exists {
		customHandlerPort = "8080"
	}
	mux := http.NewServeMux()
	// mux.HandleFunc("/api/hello/", helloHandler)
	mux.HandleFunc("/api/getreport/", getReportHandler)
	fmt.Println("Go server Listening on: ", customHandlerPort)
	log.Fatal(http.ListenAndServe(":"+customHandlerPort, mux))
}
