package src

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"strconv"
)

const public = "./public"

type Server struct {
	mux    *http.ServeMux
	addres string
}

func NewServer(config *Config) *Server {
	s := &Server{
		mux:    http.NewServeMux(),
		addres: ":" + strconv.Itoa(config.Port),
	}

	s.routes()
	return s
}

func (s *Server) routes() {
	fileServer := http.FileServer(http.Dir(public))

	s.mux.Handle("/css/", fileServer)
	s.mux.Handle("/js/", fileServer)
	s.mux.Handle("/ts/", fileServer)

	s.mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			serveFileNoCache("index.html")(w, r)
		} else {
			http.Redirect(w, r, "/", http.StatusPermanentRedirect)
		}
	})

	s.mux.HandleFunc("/about", serveFile("about.html"))
	s.mux.HandleFunc("/about.html", redirect("/about"))

	s.mux.HandleFunc("/api/status", s.apiStatus)
}

func (s *Server) Start() {
	Log.Info("Server starting", "address", s.addres)
	err := http.ListenAndServe(s.addres, s.mux)
	if err != nil {
		Log.Error("Server failed", "err", err)
	}
}

func serveFile(name string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join(public, name))
	}
}

func redirect(dest string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, dest, http.StatusPermanentRedirect)
	}
}

func serveFileNoCache(name string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filepath.Join(public, name))
	}
}

func (s *Server) apiStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{
		"running": true,
	})
}
