FROM golang:1.26.4@sha256:32c0e6e5c4f6707717051091b4d0b077464a679eaab563e11474efc5328e2aa5 AS builder

WORKDIR /app

COPY ./go.mod ./go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64 \
    go build -o generateMetricsFromJunitReport main.go