FROM golang:1.15.2-alpine

WORKDIR /app

COPY main.go ./

RUN CGO_ENABLED=0 go build -ldflags="-w -s" -o /http-sender

# starts the process passing in the argument for url and
# number of concurrent executions
CMD ["/http-sender", "http://localhost:3000", "10"]
