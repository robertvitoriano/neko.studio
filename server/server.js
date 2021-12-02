import express from 'express';
import Crawler from './crawler/anime.js';
import bCrypt from 'json-encrypt';
import Anime from './class/anime.js';
import Movie from './class/filme.js';
import request from 'request';
import cors from 'cors';
import http from 'http';
import fs from 'fs';
import util from 'util';
import stream from 'express-stream';
import superagent from 'superagent';
import axios from 'axios';

class Server {
    constructor(object){
        this.Production = object.Production;
        this.anime = object.ApiAnime || null;
        this.start(object.Site);
    }
    jCrypt(json){
        if(this.Production == 1){
            return json;
        } else{
            return json;
        }
    }
    start(Site){
        const app = express();
        const port = process.env.PORT || 5000;
        const API_ANIME = this.anime;
        app.use(cors());
        app.get(`/`, (req, res) => {
            res.send(this.jCrypt({message: `hello`}));
        });
        app.get(`/anime`, async (req, res) => {
            try {
                const animes = {}
                const anime = new Anime({
                    API_ANIME,
                    Site
                });
                const animesRecentes = await anime.getAnimesRecentes();
                res.send(this.jCrypt(animesRecentes));
            } catch (error) {
                res.send({error: true})
            }
        });
        app.get(`/anime/:anime`, async (req, res) => {
                const animeT = req.params.anime.replace(`_`, ` `)
                const animes = {}
                const animeTe = new Anime({
                    API_ANIME,
                    Site
                });
                let animeTE = await animeTe.getAnime(animeT);
                const more = await animeTe.getMoreAnime(animeTE.nomeAnime)
                animeTE[`more`] = more
                res.send(this.jCrypt(animeTE));
        });

        app.get(`/filme/:filme`, async (req, res) => {
            const filmeT = req.params.filme.replace(/\n/g,' ')
            const filme = new Movie({
                API_ANIME,
                Site
            });
            let filmeTE = await filme.getFilmeUnico(filmeT);
            const more = await filme.getMoreMovie(filmeTE.nome)
            filmeTE[`more`] = more
            res.send(this.jCrypt(filmeTE));
        });

        app.get(`/movie/:genero/:page`, async (req, res) => {
            const genero = req.params.genero
            const page = req.params.page
            const filme = new Movie({
                API_ANIME,
                Site
            });
            let filmeTE = await filme.getMovie(genero, page);
            res.send(this.jCrypt(filmeTE));
        });

        app.get(`/searchMovie/:search`, async (req, res) => {
            const search = req.params.search
            const filme = new Movie({
                API_ANIME,
                Site
            });
            let filmeTE = await filme.searchMovie(search);
            res.send(this.jCrypt(filmeTE));
        });

        app.get(`/play/:link`, async (req, res) => {
            const link = req.params.link
            const filme = new Movie({
                API_ANIME,
                Site
            });
            let filmeTE = await filme.getVideo(link);
            res.send(this.jCrypt(filmeTE));
        });

        app.get(`/genero/:genero/:page`, async (req, res) => {
            try {
                const animeT = req.params.genero
                const page = req.params.page
                const animes = {}
                const animeTe = new Anime({
                    API_ANIME,
                    Site
                });
                const animeTE = await animeTe.getGenero(animeT, page);
                res.send(animeTE)
            } catch (error) {
                console.log(error)
                res.send({error: true})
            }
        });

        app.get(`/search/:search/:page`, async (req, res) => {
            try {
                const animeT = req.params.search
                const page = req.params.page
                const animes = {}
                const animeTe = new Anime({
                    API_ANIME,
                    Site
                });
                const animeTE = await animeTe.getSearch(animeT, page);
                res.send(animeTE)
            } catch (error) {
                console.log(error)
                res.send({error: true})
            }
        });
        
        app.get(`/episodio/:episodio`, async (req, res) => {
            const animeT = req.params.episodio
            const animes = {}
            const animeTe = new Anime({
                API_ANIME,
                Site
            });
            const animeTE = await animeTe.getVideo(animeT);
            res.send({url: animeTE})
        });
        app.get(`/anime/photo/:photo`, (req, res) => {
            const decrypt = bCrypt.decrypt(req.params.photo);
            let url = `https://animesonline.cc/wp-content/uploads/`+decrypt.replace(`"`, ``);
            url = url.replace(`$`, `/`);
            request({
                url: url,
                encoding: null
            }, 
            (err, resp, buffer) => {
                if (!err && resp.statusCode === 200){
                res.set("Content-Type", "image/jpeg");
                res.send(resp.body);
                } else{
                    res.send(``)
                }
            });
        });
        app.listen(port, () => {
            console.log(`Api listada em http://localhost:${port}`);
        })
    }
};

export default Server;