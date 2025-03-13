--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: wife
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO wife;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: wife
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO wife;

--
-- Name: game; Type: TABLE; Schema: public; Owner: wife
--

CREATE TABLE public.game (
    id integer NOT NULL,
    title character varying NOT NULL,
    platform character varying NOT NULL,
    release_year integer,
    genre character varying,
    publisher character varying,
    opened character varying,
    created_at timestamp without time zone,
    price double precision,
    region character varying
);


ALTER TABLE public.game OWNER TO wife;

--
-- Name: game_id_seq; Type: SEQUENCE; Schema: public; Owner: wife
--

CREATE SEQUENCE public.game_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_id_seq OWNER TO wife;

--
-- Name: game_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: wife
--

ALTER SEQUENCE public.game_id_seq OWNED BY public.game.id;


--
-- Name: game id; Type: DEFAULT; Schema: public; Owner: wife
--

ALTER TABLE ONLY public.game ALTER COLUMN id SET DEFAULT nextval('public.game_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: wife
--

COPY public.alembic_version (version_num) FROM stdin;
aafec474102b
\.


--
-- Data for Name: game; Type: TABLE DATA; Schema: public; Owner: wife
--

COPY public.game (id, title, platform, release_year, genre, publisher, opened, created_at, price, region) FROM stdin;
1	Super Mario Bros. Wonder	Nintendo Switch	2023	\N	Nintendo	true	2025-02-04 23:34:38.939935	39	\N
2	Asterigos: Curse of the Stars Deluxe Edition	PS5	2023	\N	TinyBuild	true	2025-02-04 23:37:03.029253	45.58	\N
3	Ratchet & Clank Future: Tools of Destruction	PS3	2007	\N	Sony Computer Entertainment	true	2025-02-04 23:40:03.052445	10	\N
4	Doom Eternal	PS4	2020	\N	Bethesda Softworks	true	2025-02-04 23:41:06.802074	21.26	\N
5	Star Wars: Knights of the Old Republic	Xbox	2003	\N	LucasArts	true	2025-02-04 23:42:29.255359	10	\N
\.


--
-- Name: game_id_seq; Type: SEQUENCE SET; Schema: public; Owner: wife
--

SELECT pg_catalog.setval('public.game_id_seq', 5, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: wife
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: game game_pkey; Type: CONSTRAINT; Schema: public; Owner: wife
--

ALTER TABLE ONLY public.game
    ADD CONSTRAINT game_pkey PRIMARY KEY (id);


--
-- Name: ix_game_id; Type: INDEX; Schema: public; Owner: wife
--

CREATE INDEX ix_game_id ON public.game USING btree (id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO wife;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO wife;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO wife;


--
-- PostgreSQL database dump complete
--

