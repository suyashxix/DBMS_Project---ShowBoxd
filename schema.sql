--
-- PostgreSQL database dump
--

\restrict FFLxwyglxSkxXqWXzyad9B1EC567aS8d7YduZgXS08MOoIbhomkPNjoshWCjzJ5

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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
-- Name: fn_decrement_review_count(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_decrement_review_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ 
BEGIN UPDATE media SET aggregate_rating = (SELECT ROUND(AVG(rating)::numeric,1) FROM review where media_id = OLD.media_id), total_reviews=(select count(*) from review where media_id = OLD.media_id) where media_id = OLD.media_id;
return OLD;
end;
$$;


ALTER FUNCTION public.fn_decrement_review_count() OWNER TO postgres;

--
-- Name: fn_decrement_seats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_decrement_seats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
 IF(SELECT available_seats FROM showing WHERE showing_id = NEW.showing_id) < NEW.seats_booked THEN RAISE EXCEPTION 'Not enough available seats for showing %', NEW.showing_id; END IF; 
UPDATE showing 
SET available_seats = available_seats - NEW.seats_booked 
WHERE showing_id = NEW.showing_id;
RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_decrement_seats() OWNER TO postgres;

--
-- Name: fn_restore_seats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_restore_seats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF OLD.booking_status = 'confirmed' AND NEW.booking_status = 'cancelled' THEN
    UPDATE showing
    SET available_seats = available_seats + OLD.seats_booked  -- was "available_sets"
    WHERE showing_id = OLD.showing_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_restore_seats() OWNER TO postgres;

--
-- Name: fn_sync_total_episodes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_sync_total_episodes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN 
IF TG_OP = 'INSERT' THEN
 UPDATE season
 SET total_episodes = total_episodes+1
 WHERE season_id = NEW.season_id;
ELSIF TG_OP = 'DELETE' THEN 
 UPDATE season 
 SET total_episodes = total_episodes -1 
 WHERE season_id = OLD.season_id;
END IF;
RETURN NULL;
END;
$$;


ALTER FUNCTION public.fn_sync_total_episodes() OWNER TO postgres;

--
-- Name: fn_sync_total_seasons(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_sync_total_seasons() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ 
BEGIN 
IF TG_OP = 'INSERT' THEN 
 UPDATE public.tv_show
 SET total_seasons = total_seasons+1
 WHERE media_id = NEW.media_id
;
ELSIF TG_OP = 'DELETE' THEN 
 UPDATE tv_show 
 SET total_seasons = total_seasons-1
 WHERE media_id = OLD.media_id;
END IF;
RETURN NULL;
END;
$$;


ALTER FUNCTION public.fn_sync_total_seasons() OWNER TO postgres;

--
-- Name: fn_update_aggregate_rating(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_aggregate_rating() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ 
BEGIN
 UPDATE media
 SET aggregate_rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM review WHERE media_id = NEW.media_id),
total_reviews = (SELECT count(*) from review where media_id = NEW.media_id)
WHERE media_id = NEW.media_id;
RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_update_aggregate_rating() OWNER TO postgres;

--
-- Name: fn_update_aggregate_rating_on_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_aggregate_rating_on_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN 
UPDATE media SET aggregate_rating = (SELECT ROUND(AVG(rating)::numeric,1) from review where media_id = NEW.media_id) WHERE media_id = NEW.media_id;
RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_update_aggregate_rating_on_update() OWNER TO postgres;

--
-- Name: fn_validate_booking_price(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_validate_booking_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE 
 expected_price NUMERIC(10,2);
BEGIN 
 SELECT price * NEW.seats_booked INTO expected_price
 FROM showing
 WHERE showing_id = NEW.showing_id;
IF NEW.total_price <> expected_price THEN RAISE EXCEPTION 'total_price % does not match the expected % (seats % * price)', NEW.total_price, expected_price, NEW.seats_booked; END IF;
RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_validate_booking_price() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO postgres;

--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO postgres;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO postgres;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_permission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user (
    id integer NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(150) NOT NULL,
    last_name character varying(150) NOT NULL,
    email character varying(254) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL
);


ALTER TABLE public.auth_user OWNER TO postgres;

--
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_groups (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.auth_user_groups OWNER TO postgres;

--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_user_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_user ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_user_permissions (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_user_user_permissions OWNER TO postgres;

--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_user_user_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: booking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking (
    booking_id integer NOT NULL,
    user_id integer NOT NULL,
    showing_id integer NOT NULL,
    seats_booked integer NOT NULL,
    total_price numeric(10,2) NOT NULL,
    booking_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    booking_status character varying(20) DEFAULT 'confirmed'::character varying,
    CONSTRAINT booking_booking_status_check CHECK (((booking_status)::text = ANY (ARRAY[('confirmed'::character varying)::text, ('cancelled'::character varying)::text]))),
    CONSTRAINT booking_seats_booked_check CHECK ((seats_booked > 0)),
    CONSTRAINT booking_total_price_check CHECK ((total_price >= (0)::numeric))
);


ALTER TABLE public.booking OWNER TO postgres;

--
-- Name: booking_booking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_booking_id_seq OWNER TO postgres;

--
-- Name: booking_booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_booking_id_seq OWNED BY public.booking.booking_id;


--
-- Name: cast_crew; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cast_crew (
    media_id integer NOT NULL,
    person_id integer NOT NULL,
    role character varying(50) NOT NULL,
    character_name character varying(150),
    CONSTRAINT cast_crew_role_check CHECK (((role)::text = ANY (ARRAY[('actor'::character varying)::text, ('director'::character varying)::text, ('producer'::character varying)::text, ('writer'::character varying)::text, ('cinematographer'::character varying)::text, ('composer'::character varying)::text])))
);


ALTER TABLE public.cast_crew OWNER TO postgres;

--
-- Name: cinema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cinema (
    cinema_id integer NOT NULL,
    name character varying(150) NOT NULL,
    location character varying(100) NOT NULL,
    region character varying(100) NOT NULL,
    city character varying(100) NOT NULL,
    latitude numeric(10,8),
    longitude numeric(11,8)
);


ALTER TABLE public.cinema OWNER TO postgres;

--
-- Name: cinema_cinema_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cinema_cinema_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cinema_cinema_id_seq OWNER TO postgres;

--
-- Name: cinema_cinema_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cinema_cinema_id_seq OWNED BY public.cinema.cinema_id;


--
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id integer NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


ALTER TABLE public.django_admin_log OWNER TO postgres;

--
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_admin_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO postgres;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_content_type ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO postgres;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_migrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO postgres;

--
-- Name: episode; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.episode (
    episode_id integer NOT NULL,
    season_id integer NOT NULL,
    media_id integer NOT NULL,
    episode_number integer NOT NULL,
    title character varying(255) NOT NULL,
    duration_minutes integer,
    release_date date,
    episode_image_url character varying(500),
    description text,
    CONSTRAINT episode_duration_minutes_check CHECK ((duration_minutes > 0)),
    CONSTRAINT episode_episode_number_check CHECK ((episode_number > 0))
);


ALTER TABLE public.episode OWNER TO postgres;

--
-- Name: episode_episode_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.episode_episode_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.episode_episode_id_seq OWNER TO postgres;

--
-- Name: episode_episode_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.episode_episode_id_seq OWNED BY public.episode.episode_id;


--
-- Name: genre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.genre (
    genre_id integer NOT NULL,
    genre_name character varying(50) NOT NULL
);


ALTER TABLE public.genre OWNER TO postgres;

--
-- Name: genre_genre_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.genre_genre_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.genre_genre_id_seq OWNER TO postgres;

--
-- Name: genre_genre_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.genre_genre_id_seq OWNED BY public.genre.genre_id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    media_id integer NOT NULL,
    title character varying(255) NOT NULL,
    media_type character varying(20) NOT NULL,
    language character varying(50) NOT NULL,
    release_date date,
    duration_minutes integer,
    poster_url character varying(500),
    description text,
    aggregate_rating numeric(3,1),
    total_reviews integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT media_aggregate_rating_check CHECK (((aggregate_rating IS NULL) OR ((aggregate_rating >= (0)::numeric) AND (aggregate_rating <= (10)::numeric)))),
    CONSTRAINT media_duration_minutes_check CHECK ((duration_minutes > 0)),
    CONSTRAINT media_media_type_check CHECK (((media_type)::text = ANY (ARRAY[('movie'::character varying)::text, ('tv_show'::character varying)::text]))),
    CONSTRAINT media_total_reviews_check CHECK ((total_reviews >= 0))
);


ALTER TABLE public.media OWNER TO postgres;

--
-- Name: media_genre; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_genre (
    media_id integer NOT NULL,
    genre_id integer NOT NULL
);


ALTER TABLE public.media_genre OWNER TO postgres;

--
-- Name: media_media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_media_id_seq OWNER TO postgres;

--
-- Name: media_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_media_id_seq OWNED BY public.media.media_id;


--
-- Name: media_platform; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_platform (
    media_id integer NOT NULL,
    platform_id integer NOT NULL,
    region character varying(100) NOT NULL,
    availability_date date
);


ALTER TABLE public.media_platform OWNER TO postgres;

--
-- Name: media_similarity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_similarity (
    media_id_1 integer NOT NULL,
    media_id_2 integer NOT NULL,
    similarity_score numeric(5,4) NOT NULL,
    CONSTRAINT check_media_order CHECK ((media_id_1 < media_id_2)),
    CONSTRAINT media_similarity_similarity_score_check CHECK (((similarity_score >= (0)::numeric) AND (similarity_score <= (1)::numeric)))
);


ALTER TABLE public.media_similarity OWNER TO postgres;

--
-- Name: movie; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movie (
    media_id integer NOT NULL,
    box_office_revenue bigint,
    theatrical_release boolean DEFAULT true
);


ALTER TABLE public.movie OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    region character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    preferred_language character varying(50),
    is_verified boolean DEFAULT false,
    role character varying(20) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('user'::character varying)::text, ('admin'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: newview; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.newview AS
 SELECT user_id,
    name,
    email,
    region,
    password_hash,
    preferred_language,
    is_verified,
    role,
    created_at
   FROM public.users;


ALTER VIEW public.newview OWNER TO postgres;

--
-- Name: person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person (
    person_id integer NOT NULL,
    name character varying(150) NOT NULL,
    bio text,
    birth_date date,
    profile_image_url character varying(500)
);


ALTER TABLE public.person OWNER TO postgres;

--
-- Name: person_person_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.person_person_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.person_person_id_seq OWNER TO postgres;

--
-- Name: person_person_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.person_person_id_seq OWNED BY public.person.person_id;


--
-- Name: platform; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform (
    platform_id integer NOT NULL,
    platform_name character varying(100) NOT NULL,
    platform_type character varying(20),
    logo_url character varying(500),
    CONSTRAINT platform_platform_type_check CHECK (((platform_type)::text = ANY (ARRAY[('OTT'::character varying)::text, ('Theatrical'::character varying)::text])))
);


ALTER TABLE public.platform OWNER TO postgres;

--
-- Name: platform_platform_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.platform_platform_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_platform_id_seq OWNER TO postgres;

--
-- Name: platform_platform_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.platform_platform_id_seq OWNED BY public.platform.platform_id;


--
-- Name: review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review (
    review_id integer NOT NULL,
    media_id integer NOT NULL,
    user_id integer NOT NULL,
    rating numeric(3,1) NOT NULL,
    review_text text,
    review_date date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT review_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (10)::numeric)))
);


ALTER TABLE public.review OWNER TO postgres;

--
-- Name: review_like; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_like (
    review_id integer NOT NULL,
    user_id integer NOT NULL,
    liked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.review_like OWNER TO postgres;

--
-- Name: review_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.review_review_id_seq OWNER TO postgres;

--
-- Name: review_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_review_id_seq OWNED BY public.review.review_id;


--
-- Name: screen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.screen (
    screen_id integer NOT NULL,
    cinema_id integer NOT NULL,
    screen_name character varying(50) NOT NULL,
    total_seats integer NOT NULL,
    screen_type character varying(30),
    CONSTRAINT screen_total_seats_check CHECK ((total_seats > 0))
);


ALTER TABLE public.screen OWNER TO postgres;

--
-- Name: screen_screen_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.screen_screen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.screen_screen_id_seq OWNER TO postgres;

--
-- Name: screen_screen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.screen_screen_id_seq OWNED BY public.screen.screen_id;


--
-- Name: season; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.season (
    season_id integer NOT NULL,
    media_id integer NOT NULL,
    season_number integer NOT NULL,
    release_date date,
    total_episodes integer DEFAULT 0,
    CONSTRAINT season_season_number_check CHECK ((season_number > 0)),
    CONSTRAINT season_total_episodes_check CHECK ((total_episodes >= 0))
);


ALTER TABLE public.season OWNER TO postgres;

--
-- Name: season_season_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.season_season_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.season_season_id_seq OWNER TO postgres;

--
-- Name: season_season_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.season_season_id_seq OWNED BY public.season.season_id;


--
-- Name: showing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.showing (
    showing_id integer NOT NULL,
    media_id integer NOT NULL,
    screen_id integer NOT NULL,
    show_date date NOT NULL,
    show_time time without time zone NOT NULL,
    available_seats integer NOT NULL,
    price numeric(10,2) NOT NULL,
    CONSTRAINT showing_available_seats_check CHECK ((available_seats >= 0)),
    CONSTRAINT showing_price_check CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.showing OWNER TO postgres;

--
-- Name: showing_showing_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.showing_showing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.showing_showing_id_seq OWNER TO postgres;

--
-- Name: showing_showing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.showing_showing_id_seq OWNED BY public.showing.showing_id;


--
-- Name: tv_show; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tv_show (
    media_id integer NOT NULL,
    total_seasons integer DEFAULT 0,
    status character varying(20) DEFAULT 'upcoming'::character varying,
    CONSTRAINT tv_show_status_check CHECK (((status)::text = ANY (ARRAY[('upcoming'::character varying)::text, ('ongoing'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text]))),
    CONSTRAINT tv_show_total_seasons_check CHECK ((total_seasons >= 0))
);


ALTER TABLE public.tv_show OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: watch_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watch_history (
    user_id integer NOT NULL,
    media_id integer NOT NULL,
    episode_id integer,
    watched_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.watch_history OWNER TO postgres;

--
-- Name: watchlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watchlist (
    watchlist_id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    visibility character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT watchlist_visibility_check CHECK (((visibility)::text = ANY (ARRAY[('public'::character varying)::text, ('private'::character varying)::text])))
);


ALTER TABLE public.watchlist OWNER TO postgres;

--
-- Name: watchlist_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watchlist_item (
    watchlist_id integer NOT NULL,
    media_id integer NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.watchlist_item OWNER TO postgres;

--
-- Name: watchlist_watchlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.watchlist_watchlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.watchlist_watchlist_id_seq OWNER TO postgres;

--
-- Name: watchlist_watchlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.watchlist_watchlist_id_seq OWNED BY public.watchlist.watchlist_id;


--
-- Name: booking booking_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking ALTER COLUMN booking_id SET DEFAULT nextval('public.booking_booking_id_seq'::regclass);


--
-- Name: cinema cinema_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cinema ALTER COLUMN cinema_id SET DEFAULT nextval('public.cinema_cinema_id_seq'::regclass);


--
-- Name: episode episode_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.episode ALTER COLUMN episode_id SET DEFAULT nextval('public.episode_episode_id_seq'::regclass);


--
-- Name: genre genre_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genre ALTER COLUMN genre_id SET DEFAULT nextval('public.genre_genre_id_seq'::regclass);


--
-- Name: media media_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media ALTER COLUMN media_id SET DEFAULT nextval('public.media_media_id_seq'::regclass);


--
-- Name: person person_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person ALTER COLUMN person_id SET DEFAULT nextval('public.person_person_id_seq'::regclass);


--
-- Name: platform platform_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform ALTER COLUMN platform_id SET DEFAULT nextval('public.platform_platform_id_seq'::regclass);


--
-- Name: review review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review ALTER COLUMN review_id SET DEFAULT nextval('public.review_review_id_seq'::regclass);


--
-- Name: screen screen_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.screen ALTER COLUMN screen_id SET DEFAULT nextval('public.screen_screen_id_seq'::regclass);


--
-- Name: season season_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.season ALTER COLUMN season_id SET DEFAULT nextval('public.season_season_id_seq'::regclass);


--
-- Name: showing showing_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.showing ALTER COLUMN showing_id SET DEFAULT nextval('public.showing_showing_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: watchlist watchlist_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist ALTER COLUMN watchlist_id SET DEFAULT nextval('public.watchlist_watchlist_id_seq'::regclass);


--
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add log entry	1	add_logentry
2	Can change log entry	1	change_logentry
3	Can delete log entry	1	delete_logentry
4	Can view log entry	1	view_logentry
5	Can add permission	3	add_permission
6	Can change permission	3	change_permission
7	Can delete permission	3	delete_permission
8	Can view permission	3	view_permission
9	Can add group	2	add_group
10	Can change group	2	change_group
11	Can delete group	2	delete_group
12	Can view group	2	view_group
13	Can add user	4	add_user
14	Can change user	4	change_user
15	Can delete user	4	delete_user
16	Can view user	4	view_user
17	Can add content type	5	add_contenttype
18	Can change content type	5	change_contenttype
19	Can delete content type	5	delete_contenttype
20	Can view content type	5	view_contenttype
21	Can add session	6	add_session
22	Can change session	6	change_session
23	Can delete session	6	delete_session
24	Can view session	6	view_session
25	Can add cinema	9	add_cinema
26	Can change cinema	9	change_cinema
27	Can delete cinema	9	delete_cinema
28	Can view cinema	9	view_cinema
29	Can add genre	11	add_genre
30	Can change genre	11	change_genre
31	Can delete genre	11	delete_genre
32	Can view genre	11	view_genre
33	Can add media	12	add_media
34	Can change media	12	change_media
35	Can delete media	12	delete_media
36	Can view media	12	view_media
37	Can add person	17	add_person
38	Can change person	17	change_person
39	Can delete person	17	delete_person
40	Can view person	17	view_person
41	Can add platform	18	add_platform
42	Can change platform	18	change_platform
43	Can delete platform	18	delete_platform
44	Can view platform	18	view_platform
45	Can add season	22	add_season
46	Can change season	22	change_season
47	Can delete season	22	delete_season
48	Can view season	22	view_season
49	Can add users	25	add_users
50	Can change users	25	change_users
51	Can delete users	25	delete_users
52	Can view users	25	view_users
53	Can add movie	16	add_movie
54	Can change movie	16	change_movie
55	Can delete movie	16	delete_movie
56	Can view movie	16	view_movie
57	Can add tv show	24	add_tvshow
58	Can change tv show	24	change_tvshow
59	Can delete tv show	24	delete_tvshow
60	Can view tv show	24	view_tvshow
61	Can add media genre	13	add_mediagenre
62	Can change media genre	13	change_mediagenre
63	Can delete media genre	13	delete_mediagenre
64	Can view media genre	13	view_mediagenre
65	Can add media similarity	15	add_mediasimilarity
66	Can change media similarity	15	change_mediasimilarity
67	Can delete media similarity	15	delete_mediasimilarity
68	Can view media similarity	15	view_mediasimilarity
69	Can add cast crew	8	add_castcrew
70	Can change cast crew	8	change_castcrew
71	Can delete cast crew	8	delete_castcrew
72	Can view cast crew	8	view_castcrew
73	Can add media platform	14	add_mediaplatform
74	Can change media platform	14	change_mediaplatform
75	Can delete media platform	14	delete_mediaplatform
76	Can view media platform	14	view_mediaplatform
77	Can add review	19	add_review
78	Can change review	19	change_review
79	Can delete review	19	delete_review
80	Can view review	19	view_review
81	Can add screen	21	add_screen
82	Can change screen	21	change_screen
83	Can delete screen	21	delete_screen
84	Can view screen	21	view_screen
85	Can add episode	10	add_episode
86	Can change episode	10	change_episode
87	Can delete episode	10	delete_episode
88	Can view episode	10	view_episode
89	Can add showing	23	add_showing
90	Can change showing	23	change_showing
91	Can delete showing	23	delete_showing
92	Can view showing	23	view_showing
93	Can add review like	20	add_reviewlike
94	Can change review like	20	change_reviewlike
95	Can delete review like	20	delete_reviewlike
96	Can view review like	20	view_reviewlike
97	Can add booking	7	add_booking
98	Can change booking	7	change_booking
99	Can delete booking	7	delete_booking
100	Can view booking	7	view_booking
101	Can add watch history	26	add_watchhistory
102	Can change watch history	26	change_watchhistory
103	Can delete watch history	26	delete_watchhistory
104	Can view watch history	26	view_watchhistory
105	Can add watchlist	27	add_watchlist
106	Can change watchlist	27	change_watchlist
107	Can delete watchlist	27	delete_watchlist
108	Can view watchlist	27	view_watchlist
109	Can add watchlist item	28	add_watchlistitem
110	Can change watchlist item	28	change_watchlistitem
111	Can delete watchlist item	28	delete_watchlistitem
112	Can view watchlist item	28	view_watchlistitem
\.


--
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
\.


--
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- Data for Name: booking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.booking (booking_id, user_id, showing_id, seats_booked, total_price, booking_time, booking_status) FROM stdin;
2	3	11	2	1600.00	2026-02-03 11:15:00	confirmed
3	4	16	3	1800.00	2026-02-03 14:20:00	confirmed
4	2	19	1	300.00	2026-02-04 09:00:00	confirmed
5	4	23	2	700.00	2026-02-04 16:30:00	confirmed
6	3	5	2	1200.00	2026-02-02 18:00:00	cancelled
7	1	13	4	1400.00	2026-02-03 12:00:00	confirmed
8	2	1	2	500.00	2026-02-18 21:48:35.641016	confirmed
1	2	3	2	700.00	2026-02-03 10:30:00	cancelled
9	2	1	5	1250.00	2026-03-18 14:18:06.754045	cancelled
10	1	23	5	1750.00	2026-03-18 15:54:45.033975	confirmed
11	1	7	2	560.00	2026-03-18 16:20:36.659179	cancelled
13	1	7	5	1400.00	2026-03-18 16:29:23.181374	confirmed
12	1	7	4	1120.00	2026-03-18 16:20:41.582312	cancelled
16	1	2	115	34500.00	2026-03-18 16:50:27.519581	cancelled
15	1	1	118	29500.00	2026-03-18 16:50:21.270595	cancelled
14	1	24	2	600.00	2026-03-18 16:50:07.989889	cancelled
17	1	1	4	1000.00	2026-03-18 16:51:20.577977	confirmed
18	1	1	7	1750.00	2026-03-18 16:51:25.281147	confirmed
19	1	1	100	25000.00	2026-03-18 16:51:29.013626	confirmed
20	1	1	7	1750.00	2026-03-18 16:51:37.536528	confirmed
\.


--
-- Data for Name: cast_crew; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cast_crew (media_id, person_id, role, character_name) FROM stdin;
1	1	director	\N
1	2	actor	Dom Cobb
1	2	producer	\N
3	1	director	\N
3	3	actor	Lucius Fox
2	7	director	\N
2	4	actor	Rancho
2	4	producer	\N
4	4	actor	Mahavir Singh Phogat
5	1	director	\N
6	3	actor	Walter White
7	6	actor	Joyce Byers
8	5	actor	Sartaj Singh
\.


--
-- Data for Name: cinema; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cinema (cinema_id, name, location, region, city, latitude, longitude) FROM stdin;
1	PVR Priya	Vasant Vihar, New Delhi	India	Delhi	28.56770000	77.15480000
2	PVR Select City Walk	Saket, New Delhi	India	Delhi	28.52450000	77.20660000
3	INOX Nehru Place	Nehru Place, New Delhi	India	Delhi	28.54940000	77.25010000
4	Cinepolis DLF Place	Saket, New Delhi	India	Delhi	28.52440000	77.20670000
5	PVR Phoenix Market City	Kurla, Mumbai	India	Mumbai	19.08830000	72.89120000
6	INOX R-City	Ghatkopar, Mumbai	India	Mumbai	19.08630000	72.90830000
\.


--
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
\.


--
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	group
3	auth	permission
4	auth	user
5	contenttypes	contenttype
6	sessions	session
7	showboxd	booking
8	showboxd	castcrew
9	showboxd	cinema
10	showboxd	episode
11	showboxd	genre
12	showboxd	media
13	showboxd	mediagenre
14	showboxd	mediaplatform
15	showboxd	mediasimilarity
16	showboxd	movie
17	showboxd	person
18	showboxd	platform
19	showboxd	review
20	showboxd	reviewlike
21	showboxd	screen
22	showboxd	season
23	showboxd	showing
24	showboxd	tvshow
25	showboxd	users
26	showboxd	watchhistory
27	showboxd	watchlist
28	showboxd	watchlistitem
\.


--
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2026-03-10 21:18:36.184314+05:30
2	auth	0001_initial	2026-03-10 21:18:36.260717+05:30
3	admin	0001_initial	2026-03-10 21:18:36.287142+05:30
4	admin	0002_logentry_remove_auto_add	2026-03-10 21:18:36.293853+05:30
5	admin	0003_logentry_add_action_flag_choices	2026-03-10 21:18:36.302205+05:30
6	contenttypes	0002_remove_content_type_name	2026-03-10 21:18:36.321097+05:30
7	auth	0002_alter_permission_name_max_length	2026-03-10 21:18:36.331794+05:30
8	auth	0003_alter_user_email_max_length	2026-03-10 21:18:36.337956+05:30
9	auth	0004_alter_user_username_opts	2026-03-10 21:18:36.344493+05:30
10	auth	0005_alter_user_last_login_null	2026-03-10 21:18:36.351602+05:30
11	auth	0006_require_contenttypes_0002	2026-03-10 21:18:36.353293+05:30
12	auth	0007_alter_validators_add_error_messages	2026-03-10 21:18:36.360175+05:30
13	auth	0008_alter_user_username_max_length	2026-03-10 21:18:36.371348+05:30
14	auth	0009_alter_user_last_name_max_length	2026-03-10 21:18:36.376263+05:30
15	auth	0010_alter_group_name_max_length	2026-03-10 21:18:36.383515+05:30
16	auth	0011_update_proxy_permissions	2026-03-10 21:18:36.387735+05:30
17	auth	0012_alter_user_first_name_max_length	2026-03-10 21:18:36.393449+05:30
18	sessions	0001_initial	2026-03-10 21:18:36.403068+05:30
19	showboxd	0001_initial	2026-03-11 20:51:01.492725+05:30
20	showboxd	0002_booking_booking_status_alter_review_unique_together_and_more	2026-04-05 16:09:36.350664+05:30
\.


--
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
\.


--
-- Data for Name: episode; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.episode (episode_id, season_id, media_id, episode_number, title, duration_minutes, release_date, episode_image_url, description) FROM stdin;
19	1	6	1	Pilot	58	2008-01-20	\N	\N
20	1	6	2	Cat's in the Bag...	48	2008-01-27	\N	\N
21	1	6	3	And the Bag's in the River	48	2008-02-10	\N	\N
22	1	6	4	Cancer Man	48	2008-02-17	\N	\N
23	1	6	5	Gray Matter	48	2008-02-24	\N	\N
24	1	6	6	Crazy Handful of Nothin'	48	2008-03-02	\N	\N
25	1	6	7	A No-Rough-Stuff-Type Deal	48	2008-03-09	\N	\N
26	6	7	1	Chapter One: The Vanishing of Will Byers	47	2016-07-15	\N	\N
27	6	7	2	Chapter Two: The Weirdo on Maple Street	55	2016-07-15	\N	\N
28	6	7	3	Chapter Three: Holly, Jolly	51	2016-07-15	\N	\N
29	6	7	4	Chapter Four: The Body	50	2016-07-15	\N	\N
30	6	7	5	Chapter Five: The Flea and the Acrobat	52	2016-07-15	\N	\N
31	6	7	6	Chapter Six: The Monster	47	2016-07-15	\N	\N
32	6	7	7	Chapter Seven: The Bathtub	42	2016-07-15	\N	\N
33	6	7	8	Chapter Eight: The Upside Down	55	2016-07-15	\N	\N
34	10	8	1	Ashwathama	52	2018-07-06	\N	\N
35	10	8	2	Halahala	48	2018-07-06	\N	\N
36	10	8	3	Atapi Vatapi	45	2018-07-06	\N	\N
\.


--
-- Data for Name: genre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.genre (genre_id, genre_name) FROM stdin;
1	Action
2	Drama
3	Comedy
4	Thriller
5	Sci-Fi
6	Romance
7	Horror
8	Adventure
9	Crime
10	Mystery
11	Fantasy
12	Animation
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media (media_id, title, media_type, language, release_date, duration_minutes, poster_url, description, aggregate_rating, total_reviews, created_at) FROM stdin;
2	3 Idiots	movie	Hindi	2009-12-25	170	https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg	Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently.	8.4	200	2026-02-04 19:35:26.288616
8	Sacred Games	tv_show	Hindi	2018-07-06	50	https://image.tmdb.org/t/p/w500/bDj7kSO1bPZMIbxKhDP8nBpb0Kh.jpg	A link in their pasts leads an honest cop to a fugitive gang boss, whose cryptic warning spurs the officer on a quest to save Mumbai from cataclysm.	8.6	280	2026-02-04 19:35:38.621381
9	Game of Thrones	tv_show	English	2011-04-17	57	https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg	Nine noble families fight for control over the lands of Westeros.	9.2	850	2026-02-04 19:35:38.628784
15	The Social Network	movie	English	2004-06-15	99	https://image.tmdb.org/t/p/w500/aNcG9XXsq8kutkdgXF4AmfXlQOT.jpg	Description for The Social Network Part 2.	6.1	0	2026-02-04 22:48:36.231535
29	Midnight in Paris	movie	Hindi	2018-06-15	122	https://image.tmdb.org/t/p/w500/4wBG5kbfagTQclETblPRRGihk0I.jpg	Description for Midnight in Paris Part 16.	8.1	0	2026-02-04 22:48:36.231535
32	White Lotus	movie	Korean	1971-06-15	117	https://image.tmdb.org/t/p/w500/gbSaK9v1CbcYH1ISgbM7XObD2dW.jpg	Description for White Lotus Part 19.	7.9	0	2026-02-04 22:48:36.231535
39	The Social Network	movie	English	2018-06-15	129	https://image.tmdb.org/t/p/w500/aNcG9XXsq8kutkdgXF4AmfXlQOT.jpg	Description for The Social Network Part 26.	6.8	0	2026-02-04 22:48:36.231535
40	Beef	movie	Korean	2014-06-15	133	https://image.tmdb.org/t/p/w500/uGUgSEBZGBMHzBhADljkzNARv93.jpg	Description for Beef Part 27.	9.2	0	2026-02-04 22:48:36.231535
42	Everything Everywhere All At Once	movie	English	1972-06-15	110	https://image.tmdb.org/t/p/w500/u68AjlvlutfEIcpmbYpKcdi09ut.jpg	Description for Everything Everywhere All At Once Part 29.	6.2	0	2026-02-04 22:48:36.231535
46	Joker	movie	English	2014-06-15	135	https://image.tmdb.org/t/p/w500/1mvFLm2y4N6Et5JOFsSb9nhKPcd.jpg	Description for Joker Part 33.	7.2	0	2026-02-04 22:48:36.231535
47	The Great Gatsby	movie	Hindi	2009-06-15	176	https://image.tmdb.org/t/p/w500/tyxfCBQv6Ap74jcu3xd7aBiaa29.jpg	Description for The Great Gatsby Part 34.	7.2	0	2026-02-04 22:48:36.231535
17	Casablanca	movie	English	2012-06-15	98	https://image.tmdb.org/t/p/w500/lGCEKlJo2CnWydQj7aamY7s1S7Q.jpg	Description for Casablanca Part 4.	7.4	0	2026-02-04 22:48:36.231535
18	Arrival	movie	English	2018-06-15	133	https://image.tmdb.org/t/p/w500/ur4WjqL2n8BNbFEpdlazsqQJ1vk.jpg	Description for Arrival Part 5.	5.8	0	2026-02-04 22:48:36.231535
33	Beef	movie	Hindi	1986-06-15	167	https://image.tmdb.org/t/p/w500/uGUgSEBZGBMHzBhADljkzNARv93.jpg	Description for Beef Part 20.	9.1	0	2026-02-04 22:48:36.231535
50	The Last of Us	movie	Hindi	1990-06-15	63	https://image.tmdb.org/t/p/w500/72vtlHQiSZtUnQMdCaBT7BJlfya.jpg	Description for The Last of Us Part 37.	8.6	0	2026-02-04 22:48:36.231535
12	The Crown	tv_show	English	2016-11-04	58	https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg	Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the 20th century.	8.6	410	2026-02-04 19:35:38.643991
13	Dune: Prophecy	tv_show	English	2026-10-15	55	https://image.tmdb.org/t/p/w500/47ogI9EoyDeL5KCT9b98KLEk00I.jpg	Set 10,000 years before the ascension of Paul Atreides, follows two Harkonnen sisters as they combat forces that threaten the future of humankind.	\N	0	2026-02-04 19:35:38.647816
5	Interstellar	movie	English	2014-11-07	169	https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg	A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.	9.5	2	2026-02-04 19:35:26.318516
11	Mirzapur	tv_show	Hindi	2018-11-16	45	https://image.tmdb.org/t/p/w500/1rxLUFVrtTo82OxhbDXJDiJVkwL.jpg	A shocking incident at a wedding procession ignites a series of events entangling the lives of two families in the lawless city of Mirzapur.	8.4	290	2026-02-04 19:35:38.638719
14	The Holdovers	movie	Spanish	1992-06-15	56	https://image.tmdb.org/t/p/w500/VHSzNBTwxV8vh7wylo7O9CLdac.jpg	Description for The Holdovers Part 1.	8.3	0	2026-02-04 22:48:36.231535
16	The Bear	movie	English	2025-06-15	121	https://image.tmdb.org/t/p/w500/n0Qha1teKogUAwmZAE8XAGW7l5r.jpg	Description for The Bear Part 3.	10.0	1	2026-02-04 22:48:36.231535
24	Lady Bird	movie	Spanish	2023-06-15	83	https://image.tmdb.org/t/p/w500/gl66K7zRdtNYGrxyS2YDUP5ASZd.jpg	Description for Lady Bird Part 11.	9.3	0	2026-02-04 22:48:36.231535
31	Lady Bird	movie	Korean	1988-06-15	102	https://image.tmdb.org/t/p/w500/gl66K7zRdtNYGrxyS2YDUP5ASZd.jpg	Description for Lady Bird Part 18.	6.6	0	2026-02-04 22:48:36.231535
34	Beef	movie	Korean	2005-06-15	70	https://image.tmdb.org/t/p/w500/uGUgSEBZGBMHzBhADljkzNARv93.jpg	Description for Beef Part 21.	7.1	0	2026-02-04 22:48:36.231535
43	Moonlight	movie	French	1979-06-15	123	https://image.tmdb.org/t/p/w500/qLnfEmPrDjJfPyyddLJPkXmshkp.jpg	Description for Moonlight Part 30.	6.9	0	2026-02-04 22:48:36.231535
44	Poor Things	movie	Hindi	1997-06-15	144	https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg	Description for Poor Things Part 31.	6.7	0	2026-02-04 22:48:36.231535
45	Whiplash	movie	Spanish	2011-06-15	153	https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg	Description for Whiplash Part 32.	7.7	0	2026-02-04 22:48:36.231535
48	Midnight in Paris	movie	Hindi	2022-06-15	170	https://image.tmdb.org/t/p/w500/4wBG5kbfagTQclETblPRRGihk0I.jpg	Description for Midnight in Paris Part 35.	8.6	0	2026-02-04 22:48:36.231535
51	The Shape of Water	movie	English	1973-06-15	76	https://image.tmdb.org/t/p/w500/9zfwPffUXpBrEP26yp0q1ckXDcj.jpg	Description for The Shape of Water Part 38.	9.0	0	2026-02-04 22:48:36.231535
52	The Last of Us	movie	English	2017-06-15	57	https://image.tmdb.org/t/p/w500/72vtlHQiSZtUnQMdCaBT7BJlfya.jpg	Description for The Last of Us Part 39.	6.4	0	2026-02-04 22:48:36.231535
58	Joker	movie	English	2013-06-15	157	https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg	Description for Joker Part 45.	7.3	0	2026-02-04 22:48:36.231535
70	Citizen Kane	movie	Hindi	2012-06-15	133	https://image.tmdb.org/t/p/w500/sav0jxhqiH0bPr2vZFU0Kjt2nZL.jpg	Description for Citizen Kane Part 57.	5.8	0	2026-02-04 22:48:36.231535
74	Beef	movie	Spanish	1976-06-15	139	https://image.tmdb.org/t/p/w500/uGUgSEBZGBMHzBhADljkzNARv93.jpg	Description for Beef Part 61.	9.3	0	2026-02-04 22:48:36.231535
81	White Lotus	movie	Korean	1976-06-15	84	https://image.tmdb.org/t/p/w500/pEzzzy3vzge65hdbKsTNFYcDdyO.jpg	Description for White Lotus Part 68.	8.7	0	2026-02-04 22:48:36.231535
84	Whiplash	tv_show	Spanish	1992-06-15	106	https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg	Description for Whiplash Part 71.	8.5	0	2026-02-04 22:48:36.231535
87	The Great Gatsby	tv_show	Spanish	1997-06-15	177	https://image.tmdb.org/t/p/w500/tyxfCBQv6Ap74jcu3xd7aBiaa29.jpg	Description for The Great Gatsby Part 74.	7.3	0	2026-02-04 22:48:36.231535
88	A Clockwork Orange	tv_show	French	1989-06-15	95	https://image.tmdb.org/t/p/w500/4sHeTAp65WrSSuc05nRBKddhBxO.jpg	Description for A Clockwork Orange Part 75.	9.0	0	2026-02-04 22:48:36.231535
91	Lady Bird	tv_show	English	1978-06-15	58	https://image.tmdb.org/t/p/w500/gl66K7zRdtNYGrxyS2YDUP5ASZd.jpg	Description for Lady Bird Part 78.	8.2	0	2026-02-04 22:48:36.231535
62	La La Land	movie	Spanish	1973-06-15	176	https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg	Description for La La Land Part 49.	7.9	0	2026-02-04 22:48:36.231535
66	1917	movie	English	2012-06-15	163	https://image.tmdb.org/t/p/w500/iZf0KyrE25z1sage4SYFLCCrMi9.jpg	Description for 1917 Part 53.	9.0	0	2026-02-04 22:48:36.231535
79	The Grand Budapest Hotel	movie	Korean	2005-06-15	158	https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg	Description for The Grand Budapest Hotel Part 66.	8.8	0	2026-02-04 22:48:36.231535
89	The Social Network	tv_show	Hindi	2007-06-15	111	https://image.tmdb.org/t/p/w500/aNcG9XXsq8kutkdgXF4AmfXlQOT.jpg	Description for The Social Network Part 76.	6.5	0	2026-02-04 22:48:36.231535
90	Citizen Kane	tv_show	Korean	1992-06-15	151	https://image.tmdb.org/t/p/w500/sav0jxhqiH0bPr2vZFU0Kjt2nZL.jpg	Description for Citizen Kane Part 77.	6.4	0	2026-02-04 22:48:36.231535
92	The Great Gatsby	tv_show	French	1986-06-15	173	https://image.tmdb.org/t/p/w500/tyxfCBQv6Ap74jcu3xd7aBiaa29.jpg	Description for The Great Gatsby Part 79.	7.7	0	2026-02-04 22:48:36.231535
94	Mad Max: Fury Road	tv_show	English	1972-06-15	72	https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg	Description for Mad Max: Fury Road Part 81.	7.4	0	2026-02-04 22:48:36.231535
98	Whiplash	tv_show	Korean	2014-06-15	96	https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg	Description for Whiplash Part 85.	5.6	0	2026-02-04 22:48:36.231535
57	The Social Network	movie	Hindi	1987-06-15	86	https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg	Description for The Social Network Part 44.	9.1	0	2026-02-04 22:48:36.231535
67	La La Land	movie	Hindi	2019-06-15	144	https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg	Description for La La Land Part 54.	6.9	0	2026-02-04 22:48:36.231535
72	Beef	movie	Spanish	1980-06-15	129	https://image.tmdb.org/t/p/w500/uGUgSEBZGBMHzBhADljkzNARv93.jpg	Description for Beef Part 59.	9.1	0	2026-02-04 22:48:36.231535
73	La La Land	movie	Korean	1988-06-15	45	https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg	Description for La La Land Part 60.	8.9	0	2026-02-04 22:48:36.231535
77	The Holdovers	movie	Hindi	1984-06-15	78	https://image.tmdb.org/t/p/w500/VHSzNBTwxV8vh7wylo7O9CLdac.jpg	Description for The Holdovers Part 64.	6.1	0	2026-02-04 22:48:36.231535
80	The Last of Us	movie	Korean	1989-06-15	46	https://image.tmdb.org/t/p/w500/72vtlHQiSZtUnQMdCaBT7BJlfya.jpg	Description for The Last of Us Part 67.	7.0	0	2026-02-04 22:48:36.231535
86	The Social Network	tv_show	French	1997-06-15	135	https://image.tmdb.org/t/p/w500/aNcG9XXsq8kutkdgXF4AmfXlQOT.jpg	Description for The Social Network Part 73.	7.9	0	2026-02-04 22:48:36.231535
96	Oppenheimer	tv_show	Hindi	1985-06-15	90	https://image.tmdb.org/t/p/w500/vP5dFYoP6vUUNavVDX98a5q01tq.jpg	Description for Oppenheimer Part 83.	8.7	0	2026-02-04 22:48:36.231535
100	White Lotus	tv_show	Korean	2005-06-15	108	https://image.tmdb.org/t/p/w500/gbSaK9v1CbcYH1ISgbM7XObD2dW.jpg	Description for White Lotus Part 87.	7.5	0	2026-02-04 22:48:36.231535
102	1917	tv_show	Korean	2009-06-15	139	https://image.tmdb.org/t/p/w500/1qKxK78LUlCCc9hvZPRVDtKNXSY.jpg	Description for 1917 Part 89.	7.7	0	2026-02-04 22:48:36.231535
103	Barbie	tv_show	English	1993-06-15	54	https://image.tmdb.org/t/p/w500/zKfE4AevCL8RjfcrhfJZat5vWTb.jpg	Description for Barbie Part 90.	7.5	0	2026-02-04 22:48:36.231535
107	Beef	tv_show	French	1984-06-15	90	https://image.tmdb.org/t/p/w500/4b4v7RnPhNyPEaVGFarEuo74r8W.jpg	Description for Beef Part 94.	8.3	0	2026-02-04 22:48:36.231535
101	The Holdovers	tv_show	English	1978-06-15	66	https://image.tmdb.org/t/p/w500/VHSzNBTwxV8vh7wylo7O9CLdac.jpg	Description for The Holdovers Part 88.	9.1	0	2026-02-04 22:48:36.231535
68	The Social Network	movie	Spanish	2017-06-15	77	https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg	Description for The Social Network Part 55.	8.0	0	2026-02-04 22:48:36.231535
69	The Bear	movie	Hindi	1989-06-15	93	https://image.tmdb.org/t/p/w500/n0Qha1teKogUAwmZAE8XAGW7l5r.jpg	Description for The Bear Part 56.	7.4	0	2026-02-04 22:48:36.231535
85	Everything Everywhere All At Once	tv_show	French	2004-06-15	52	https://image.tmdb.org/t/p/w500/u68AjlvlutfEIcpmbYpKcdi09ut.jpg	Description for Everything Everywhere All At Once Part 72.	7.5	0	2026-02-04 22:48:36.231535
106	Get Out	tv_show	Korean	1989-06-15	67	https://image.tmdb.org/t/p/w500/mE24wUCfjK8AoBBjaMjho7Rczr7.jpg	Description for Get Out Part 93.	5.9	0	2026-02-04 22:48:36.231535
109	Get Out	tv_show	Spanish	2022-06-15	62	https://image.tmdb.org/t/p/w500/mE24wUCfjK8AoBBjaMjho7Rczr7.jpg	Description for Get Out Part 96.	6.3	0	2026-02-04 22:48:36.231535
93	Citizen Kane	tv_show	Spanish	1976-06-15	160	https://image.tmdb.org/t/p/w500/sav0jxhqiH0bPr2vZFU0Kjt2nZL.jpg	Description for Citizen Kane Part 80.	6.2	0	2026-02-04 22:48:36.231535
95	The Social Network	tv_show	Spanish	2020-06-15	108	https://image.tmdb.org/t/p/w500/aNcG9XXsq8kutkdgXF4AmfXlQOT.jpg	Description for The Social Network Part 82.	8.2	0	2026-02-04 22:48:36.231535
97	Citizen Kane	tv_show	English	1982-06-15	117	https://image.tmdb.org/t/p/w500/sav0jxhqiH0bPr2vZFU0Kjt2nZL.jpg	Description for Citizen Kane Part 84.	6.4	0	2026-02-04 22:48:36.231535
99	Midnight in Paris	tv_show	Hindi	2015-06-15	72	https://image.tmdb.org/t/p/w500/4wBG5kbfagTQclETblPRRGihk0I.jpg	Description for Midnight in Paris Part 86.	6.5	0	2026-02-04 22:48:36.231535
113	Blade Runner 2049	tv_show	Korean	2013-06-15	105	https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg	Description for Blade Runner 2049 Part 100.	8.5	1	2026-02-04 22:48:36.231535
112	A Clockwork Orange	tv_show	French	1990-06-15	88	https://image.tmdb.org/t/p/w500/4sHeTAp65WrSSuc05nRBKddhBxO.jpg	Description for A Clockwork Orange Part 99.	8.1	0	2026-02-04 22:48:36.231535
110	1917	tv_show	English	1992-06-15	112	https://image.tmdb.org/t/p/w500/1qKxK78LUlCCc9hvZPRVDtKNXSY.jpg	Description for 1917 Part 97.	7.5	0	2026-02-04 22:48:36.231535
111	Everything Everywhere All At Once	tv_show	Korean	1983-06-15	144	https://image.tmdb.org/t/p/w500/u68AjlvlutfEIcpmbYpKcdi09ut.jpg	Description for Everything Everywhere All At Once Part 98.	8.1	0	2026-02-04 22:48:36.231535
115	One Battle After Another	movie	en	2026-01-01	\N	https://image.tmdb.org/t/p/w500/lbBWwxBht4JFP5PsuJ5onpMqugW.jpg	\N	9.0	0	2026-04-06 20:15:55.429815
117	Hamnet	movie	en	2026-01-01	\N	https://image.tmdb.org/t/p/w500/vbeyOZm2bvBXcbgPD3v6o94epPX.jpg	\N	8.5	0	2026-04-06 20:15:55.429815
7	Stranger Things	tv_show	English	2016-07-15	51	https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg	When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.	5.2	13	2026-02-04 19:35:38.616102
119	KPop Demon Hunters	movie	en	2026-01-01	\N	https://image.tmdb.org/t/p/w500/dTqYRhRzKayrCcDVqIS3bXOiRR5.jpg	\N	8.0	0	2026-04-06 20:15:55.429815
120	Sentimental Value	movie	en	2026-01-01	\N	https://image.tmdb.org/t/p/w500/pz9NCWxxOk3o0W3v1Zkhawrwb4i.jpg	\N	7.8	0	2026-04-06 20:15:55.429815
121	Frankenstein	movie	en	2026-01-01	\N	https://image.tmdb.org/t/p/w500/g4JtvGlQO7DByTI6frUobqvSL3R.jpg	\N	8.3	0	2026-04-06 20:15:55.429815
1	Inception	movie	English	2010-07-16	148	https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg	A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.	5.6	14	2026-02-04 19:35:26.273585
3	The Dark Knight	movie	English	2008-07-18	152	https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg	When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.	9.1	5	2026-02-04 19:35:26.297429
4	Dangal	movie	Hindi	2016-12-23	161	https://image.tmdb.org/t/p/w500/1CoKNi3XVyijPCvy0usDbSWEXAg.jpg	Former wrestler Mahavir Singh Phogat trains his daughters to become world-class wrestlers.	10.0	1	2026-02-04 19:35:26.310537
6	Breaking Bad	tv_show	English	2008-01-20	47	https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg	A chemistry teacher diagnosed with cancer teams up with a former student to manufacture crystal meth.	9.5	500	2026-02-04 19:35:38.603707
10	House of the Dragon	tv_show	English	2022-08-21	60	https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg	The Dance of Dragons: civil war erupts in Westeros 200 years before Game of Thrones.	9.0	1	2026-02-04 19:35:38.63316
19	Beef	movie	Spanish	2020-06-15	141	https://image.tmdb.org/t/p/w500/uGUgSEBZGBMHzBhADljkzNARv93.jpg	Description for Beef Part 6.	7.8	0	2026-02-04 22:48:36.231535
20	Poor Things	movie	English	1985-06-15	107	https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg	Description for Poor Things Part 7.	6.9	0	2026-02-04 22:48:36.231535
138	Minions & Monsters	movie	English	2026-07-02	100	https://image.tmdb.org/t/p/w500/s2IruLQG6577vX9SBMhuoEqK4WF.jpg	Minions unleash chaos once again in a fun-filled adventure with unexpected monstrous twists.	\N	0	2026-04-07 00:23:58.395188
139	Moana	movie	English	2026-07-10	110	https://m.media-amazon.com/images/M/MV5BMTg1MjM5M2ItMTU0My00YzI2LTg5NzEtZGNmN2ZmNzhiNjQ1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	Moana embarks on a new journey across the ocean, discovering deeper connections to her heritage.	\N	0	2026-04-07 00:23:58.395188
118	Weapons	movie	en	2026-01-01	\N	https://image.tmdb.org/t/p/w500/cpf7vsRZ0MYRQcnLWteD5jK9ymT.jpg	\N	8.2	0	2026-04-06 20:15:55.429815
116	Sinners	movie	en	2026-01-01	\N	https://image.tmdb.org/t/p/w500/705nQHqe4JGdEisrQmVYmXyjs1U.jpg	\N	8.8	0	2026-04-06 20:15:55.429815
134	Masters of the Universe	movie	English	2026-06-05	130	https://image.tmdb.org/t/p/w500/nm2ianYVp7OXElUZVeeAbNTqBLr.jpg	He-Man rises once more to defend Eternia in a grand battle between good and evil.	\N	0	2026-04-07 00:23:58.395188
21	The Last of Us	movie	English	2008-06-15	104	https://image.tmdb.org/t/p/w500/1FVraFByPjGq2RB4IdT1glHsPCW.jpg	Description for The Last of Us Part 8.	6.0	0	2026-02-04 22:48:36.231535
22	Midnight in Paris	movie	Hindi	2024-06-15	60	https://image.tmdb.org/t/p/w500/4wBG5kbfagTQclETblPRRGihk0I.jpg	Description for Midnight in Paris Part 9.	7.1	0	2026-02-04 22:48:36.231535
23	The Shape of Water	movie	French	2001-06-15	179	https://image.tmdb.org/t/p/w500/9zfwPffUXpBrEP26yp0q1ckXDcj.jpg	Description for The Shape of Water Part 10.	9.4	0	2026-02-04 22:48:36.231535
25	The Grand Budapest Hotel	movie	English	2010-06-15	58	https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg	Description for The Grand Budapest Hotel Part 12.	8.0	0	2026-02-04 22:48:36.231535
26	Eternal Sunshine of the Spotless Mind	movie	Hindi	2005-06-15	83	https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg	Description for Eternal Sunshine of the Spotless Mind Part 13.	5.8	0	2026-02-04 22:48:36.231535
27	Moonlight	movie	Korean	1972-06-15	160	https://image.tmdb.org/t/p/w500/qLnfEmPrDjJfPyyddLJPkXmshkp.jpg	Description for Moonlight Part 14.	8.1	0	2026-02-04 22:48:36.231535
28	Everything Everywhere All At Once	movie	Korean	2006-06-15	60	https://image.tmdb.org/t/p/w500/u68AjlvlutfEIcpmbYpKcdi09ut.jpg	Description for Everything Everywhere All At Once Part 15.	5.6	0	2026-02-04 22:48:36.231535
30	Succession	movie	Hindi	1987-06-15	60	https://image.tmdb.org/t/p/w500/vSiu88D4Ig07AossPAn73lYHfzB.jpg	Description for Succession Part 17.	8.6	0	2026-02-04 22:48:36.231535
35	La La Land	movie	Spanish	1996-06-15	180	https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg	Description for La La Land Part 22.	6.1	0	2026-02-04 22:48:36.231535
36	Poor Things	movie	Spanish	1999-06-15	123	https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg	Description for Poor Things Part 23.	8.6	0	2026-02-04 22:48:36.231535
37	Poor Things	movie	Korean	2003-06-15	155	https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg	Description for Poor Things Part 24.	8.6	0	2026-02-04 22:48:36.231535
38	Get Out	movie	Spanish	2013-06-15	128	https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg	Description for Get Out Part 25.	5.6	0	2026-02-04 22:48:36.231535
41	Lady Bird	movie	Hindi	1972-06-15	63	https://image.tmdb.org/t/p/w500/gl66K7zRdtNYGrxyS2YDUP5ASZd.jpg	Description for Lady Bird Part 28.	9.0	0	2026-02-04 22:48:36.231535
49	Lady Bird	movie	French	2006-06-15	118	https://image.tmdb.org/t/p/w500/gl66K7zRdtNYGrxyS2YDUP5ASZd.jpg	Description for Lady Bird Part 36.	9.1	0	2026-02-04 22:48:36.231535
53	Everything Everywhere All At Once	movie	Korean	1973-06-15	59	https://image.tmdb.org/t/p/w500/u68AjlvlutfEIcpmbYpKcdi09ut.jpg	Description for Everything Everywhere All At Once Part 40.	9.1	0	2026-02-04 22:48:36.231535
54	Succession	movie	Spanish	1983-06-15	67	https://image.tmdb.org/t/p/w500/vSiu88D4Ig07AossPAn73lYHfzB.jpg	Description for Succession Part 41.	6.5	0	2026-02-04 22:48:36.231535
55	Beef	movie	Spanish	1989-06-15	95	https://image.tmdb.org/t/p/w500/uGUgSEBZGBMHzBhADljkzNARv93.jpg	Description for Beef Part 42.	8.4	0	2026-02-04 22:48:36.231535
56	Mad Max: Fury Road	movie	Spanish	2022-06-15	123	https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg	Description for Mad Max: Fury Road Part 43.	6.3	0	2026-02-04 22:48:36.231535
59	Eternal Sunshine of the Spotless Mind	movie	Korean	1984-06-15	116	https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg	Description for Eternal Sunshine of the Spotless Mind Part 46.	7.5	0	2026-02-04 22:48:36.231535
60	Citizen Kane	movie	Korean	1970-06-15	120	https://image.tmdb.org/t/p/w500/sav0jxhqiH0bPr2vZFU0Kjt2nZL.jpg	Description for Citizen Kane Part 47.	8.1	0	2026-02-04 22:48:36.231535
61	Arrival	movie	Hindi	2023-06-15	178	https://image.tmdb.org/t/p/w500/pEzNVQfdzYDzVK0XqxERIw2x2se.jpg	Description for Arrival Part 48.	8.6	0	2026-02-04 22:48:36.231535
63	The Shape of Water	movie	English	2018-06-15	101	https://image.tmdb.org/t/p/w500/9zfwPffUXpBrEP26yp0q1ckXDcj.jpg	Description for The Shape of Water Part 50.	5.9	0	2026-02-04 22:48:36.231535
64	Whiplash	movie	French	1991-06-15	141	https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg	Description for Whiplash Part 51.	6.3	0	2026-02-04 22:48:36.231535
65	Beef	movie	Spanish	1978-06-15	69	https://image.tmdb.org/t/p/w500/uGUgSEBZGBMHzBhADljkzNARv93.jpg	Description for Beef Part 52.	9.2	0	2026-02-04 22:48:36.231535
71	Casablanca	movie	English	1995-06-15	109	https://image.tmdb.org/t/p/w500/lGCEKlJo2CnWydQj7aamY7s1S7Q.jpg	Description for Casablanca Part 58.	6.1	0	2026-02-04 22:48:36.231535
75	Beef	movie	Hindi	2017-06-15	101	https://image.tmdb.org/t/p/w500/uGUgSEBZGBMHzBhADljkzNARv93.jpg	Description for Beef Part 62.	8.7	0	2026-02-04 22:48:36.231535
76	The Great Gatsby	movie	Hindi	1998-06-15	47	https://image.tmdb.org/t/p/w500/tyxfCBQv6Ap74jcu3xd7aBiaa29.jpg	Description for The Great Gatsby Part 63.	7.2	0	2026-02-04 22:48:36.231535
78	The Last of Us	movie	Korean	1979-06-15	180	https://image.tmdb.org/t/p/w500/1FVraFByPjGq2RB4IdT1glHsPCW.jpg	Description for The Last of Us Part 65.	6.1	0	2026-02-04 22:48:36.231535
82	Casablanca	movie	Hindi	1972-06-15	92	https://image.tmdb.org/t/p/w500/lGCEKlJo2CnWydQj7aamY7s1S7Q.jpg	Description for Casablanca Part 69.	8.0	0	2026-02-04 22:48:36.231535
83	The Great Gatsby	movie	Korean	1978-06-15	55	https://image.tmdb.org/t/p/w500/tyxfCBQv6Ap74jcu3xd7aBiaa29.jpg	Description for The Great Gatsby Part 70.	9.4	0	2026-02-04 22:48:36.231535
105	Barbie	tv_show	Korean	2010-06-15	108	https://image.tmdb.org/t/p/w500/c7HIZXKDaDekFAIcWU7bxP8cTv6.jpg	Description for Barbie Part 92.	8.0	0	2026-02-04 22:48:36.231535
104	The Grand Budapest Hotel	tv_show	Spanish	2023-06-15	85	https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg	Description for The Grand Budapest Hotel Part 91.	9.3	0	2026-02-04 22:48:36.231535
108	Midnight in Paris	tv_show	Hindi	2023-06-15	90	https://image.tmdb.org/t/p/w500/4wBG5kbfagTQclETblPRRGihk0I.jpg	Description for Midnight in Paris Part 95.	5.6	0	2026-02-04 22:48:36.231535
125	The Conjuring: Last Rites	movie	English	2026-04-21	110	https://image.tmdb.org/t/p/w500/byWgphT74ClOVa8EOGzYDkl8DVL.jpg	The Warrens face one final terrifying case as sinister forces push them to their limits.	\N	0	2026-04-07 00:23:58.395188
128	The Devil Wears Prada 2	movie	English	2026-05-01	120	https://image.tmdb.org/t/p/w500/p35IoKfBtJDNiWJMO8ZEtIMZSfW.jpg	The fashion world returns with new rivalries, ambitions, and the price of staying on top.	\N	0	2026-04-07 00:23:58.395188
140	The Odyssey	movie	English	2026-07-17	150	https://m.media-amazon.com/images/M/MV5BN2MyYjk2MWMtODMyZS00MDUyLWE0OGQtOTQ3MGY0MDE0ZjVmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	An epic retelling of the legendary journey, filled with myth, struggle, and human resilience.	\N	0	2026-04-07 00:23:58.395188
135	Disclosure Day	movie	English	2026-06-12	120	https://image.tmdb.org/t/p/w500/7RYO0KTXIJ0rS0LqnCQLxeNR3P3.jpg	A mysterious event shakes humanity, forcing the world to confront truths beyond imagination.	\N	0	2026-04-07 00:23:58.395188
136	Toy Story 5	movie	English	2026-06-19	105	https://image.tmdb.org/t/p/w500/dWIAOC9EKFehGs3CYvDQih3hxaG.jpg	Woody, Buzz, and the gang return for a heartfelt journey filled with nostalgia and new beginnings.	\N	0	2026-04-07 00:23:58.395188
137	Supergirl	movie	English	2026-06-26	125	https://hips.hearstapps.com/hmg-prod/images/supergirl-poster-693aa268417d9.jpg	A new hero takes flight as Supergirl faces powerful enemies and discovers her true strength.	\N	0	2026-04-07 00:23:58.395188
131	Mortal Kombat II	movie	English	2026-05-15	125	https://image.tmdb.org/t/p/w500/lIsMeDbwntNXSUVHmWMMRXEZOVc.jpg	The battle intensifies as fighters return for a more brutal and visually explosive tournament.	\N	0	2026-04-07 00:23:58.395188
124	The Running Man	movie	English	2026-04-17	130	https://image.tmdb.org/t/p/w500/dKL78O9zxczVgjtNcQ9UkbYLzqX.jpg	In a brutal dystopian future, survival becomes entertainment in a deadly televised game of life and death.	\N	0	2026-04-07 00:23:58.395188
145	Avengers: Doomsday	movie	English	2026-12-18	150	https://image.tmdb.org/t/p/w500/8HkIe2i4ScpCkcX9SzZ9IPasqWV.jpg	The Avengers face their most dangerous enemy yet in a universe-altering showdown.	\N	0	2026-04-07 00:23:58.395188
146	Avengers: Secret Wars	movie	English	2027-12-17	160	https://image.tmdb.org/t/p/w500/f0YBuh4hyiAheXhh4JnJWoKi9g5.jpg	The multiverse saga reaches its peak as heroes unite for the ultimate battle across realities.	\N	0	2026-04-07 00:23:58.395188
147	Blade	movie	English	2026-11-20	120	https://image.tmdb.org/t/p/w500/oWT70TvbsmQaqyphCZpsnQR7R32.jpg	Blade returns to hunt the undead in a darker, more brutal take on the vampire saga.	\N	0	2026-04-07 00:23:58.395188
148	Shang-Chi 2: The Wreckage of Time	movie	English	2026-09-15	135	https://m.media-amazon.com/images/M/MV5BYWRiY2NiZmYtMDhjOS00Y2I4LTg3YzItODQzMTQ1MWE3OWUzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	Shang-Chi returns to face a threat that challenges both time and destiny.	\N	0	2026-04-07 00:23:58.395188
149	Spider-Man: Beyond the Spider-Verse	movie	English	2026-08-20	125	https://image.tmdb.org/t/p/w500/9PIhQqqI6Q4a5YjwMjxvzZcPJhf.jpg	Miles Morales continues his journey across the multiverse in a visually stunning animated adventure.	\N	0	2026-04-07 00:23:58.395188
122	Sarah's Oil	movie	English	2026-04-15	120	https://image.tmdb.org/t/p/w500/Av1CK61z33v2OBFLD1yF5rdRxQ1.jpg	A gripping drama centered around ambition, power, and the cost of chasing success in a changing world.	\N	0	2026-04-07 00:23:58.395188
123	Lee Cronin's The Mummy	movie	English	2026-04-17	115	https://image.tmdb.org/t/p/w500/aENH9ETtWynb6T1XhRwIFlvkBzI.jpg	A fresh and darker reimagining of the iconic Mummy legend, blending horror with modern storytelling.	\N	0	2026-04-07 00:23:58.395188
126	Apex	movie	English	2026-04-24	125	https://image.tmdb.org/t/p/w500/5TGSFX6dxYfM2balJrFoSVB42Nv.jpg	A high-stakes survival thriller where instinct and strategy are the only way out.	\N	0	2026-04-07 00:23:58.395188
127	Michael	movie	English	2026-04-24	140	https://image.tmdb.org/t/p/w500/dLhIYRptZACtKbQ3Lyf9wbqZKFT.jpg	A powerful biopic exploring the rise, struggles, and legacy of one of the greatest performers of all time.	\N	0	2026-04-07 00:23:58.395188
129	The Sheep Detectives	movie	English	2026-05-08	105	https://image.tmdb.org/t/p/w500/6QtL9rl3Zb4d8qW6EJ4qO5hSSfU.jpg	A quirky mystery unfolds as unlikely detectives piece together clues in a charming countryside case.	\N	0	2026-04-07 00:23:58.395188
130	In the Grey	movie	English	2026-05-15	130	https://www.themoviedb.org/t/p/w1280/kDAB1LqDroHuzq6tbskKVJGMR1y.jpg	A tense action drama where trust is fragile and survival depends on choices made in the shadows.	\N	0	2026-04-07 00:23:58.395188
132	Tom Clancy's Jack Ryan: Ghost War	movie	English	2026-05-20	135	https://m.media-amazon.com/images/M/MV5BZDFlYzU3NDQtM2I5Yy00YzZkLWE2MjYtZWQ4YmE1N2FmODU4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg	Jack Ryan uncovers a global conspiracy that could ignite a new era of covert warfare.	\N	0	2026-04-07 00:23:58.395188
133	Star Wars: The Mandalorian and Grogu	movie	English	2026-05-22	140	https://image.tmdb.org/t/p/w500/7QujwMB124KqSPbWlLRHBO5wygE.jpg	The galaxy expands as familiar faces and new allies embark on an epic Star Wars adventure.	\N	0	2026-04-07 00:23:58.395188
141	Spider-Man: Brand New Day	movie	English	2026-07-31	130	https://image.tmdb.org/t/p/w500/ucQ0QBXXQPSxeUmWfh4YQenIuB9.jpg	Peter Parker faces a new chapter as Spider-Man, balancing responsibility and personal sacrifice.	\N	0	2026-04-07 00:23:58.395188
142	DIGGER	movie	English	2026-10-02	120	https://image.tmdb.org/t/p/w500/tAvpvFXxbaeNmhcHwVPtZyLh76X.jpg	A lighthearted yet emotional story exploring friendship, identity, and second chances.	\N	0	2026-04-07 00:23:58.395188
143	Street Fighter	movie	English	2026-10-10	125	https://image.tmdb.org/t/p/w500/6yh95dD2Y6uWAlPfWCZZygBM1ec.jpg	Iconic fighters return in a live-action spectacle packed with intense battles and fan-favorite characters.	\N	0	2026-04-07 00:23:58.395188
144	The Cat in the Hat	movie	English	2026-11-06	95	https://image.tmdb.org/t/p/w500/uYYLz67e5xEQMsY858VSSCDsLU6.jpg	A whimsical and colorful tale that brings the beloved classic character back to life.	\N	0	2026-04-07 00:23:58.395188
\.


--
-- Data for Name: media_genre; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_genre (media_id, genre_id) FROM stdin;
1	1
1	5
1	4
2	3
2	2
3	1
3	9
3	4
4	2
5	5
5	2
5	8
6	9
6	2
6	4
7	5
7	7
7	10
8	9
8	4
8	2
9	11
9	2
9	8
10	11
10	2
10	8
11	9
11	1
11	4
12	2
13	5
13	11
13	8
\.


--
-- Data for Name: media_platform; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_platform (media_id, platform_id, region, availability_date) FROM stdin;
1	1	India	2020-01-15
1	1	USA	2020-01-15
1	2	India	2021-06-10
2	1	India	2019-05-20
2	2	India	2018-12-25
3	1	USA	2020-03-01
3	5	USA	2021-01-01
3	7	India	2020-06-15
4	1	India	2017-06-23
4	7	India	2017-05-01
5	2	India	2020-08-15
5	2	USA	2020-08-15
6	1	India	2018-01-01
6	1	USA	2013-09-29
7	1	India	2016-07-15
7	1	USA	2016-07-15
8	1	India	2018-07-06
8	1	USA	2018-07-06
9	5	USA	2011-04-17
9	7	India	2020-04-01
10	5	USA	2022-08-21
10	7	India	2022-08-21
11	2	India	2018-11-16
11	2	USA	2018-11-16
12	1	India	2016-11-04
12	1	USA	2016-11-04
13	5	USA	2026-10-15
13	7	India	2026-10-15
\.


--
-- Data for Name: media_similarity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_similarity (media_id_1, media_id_2, similarity_score) FROM stdin;
1	5	0.8500
3	6	0.7200
6	8	0.7800
8	11	0.9000
9	10	0.9500
7	13	0.6500
2	4	0.7500
1	3	0.7000
5	13	0.6800
9	12	0.5500
\.


--
-- Data for Name: movie; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movie (media_id, box_office_revenue, theatrical_release) FROM stdin;
1	836800000	t
2	460000000	t
3	1005000000	t
4	2024000000	t
5	677471000	t
13	\N	t
134	\N	t
135	\N	t
136	\N	t
137	\N	t
138	\N	t
139	\N	t
140	\N	t
122	\N	t
123	\N	t
124	\N	t
125	\N	t
126	\N	t
127	\N	t
128	\N	t
129	\N	t
130	\N	t
131	\N	t
132	\N	t
133	\N	t
141	\N	t
142	\N	t
143	\N	t
144	\N	t
145	\N	t
146	\N	t
147	\N	t
148	\N	t
149	\N	t
\.


--
-- Data for Name: person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person (person_id, name, bio, birth_date, profile_image_url) FROM stdin;
311	Andrew Garfield	\N	1995-08-12	\N
146	Johnny Depp	\N	1963-06-09	\N
147	Scarlett Johansson	\N	1984-11-22	\N
148	Chris Hemsworth	\N	1983-08-11	\N
149	Chris Evans	\N	1981-06-13	\N
1	Christopher Nolan	\N	1970-07-30	\N
2	Leonardo DiCaprio	\N	1974-11-11	\N
3	Morgan Freeman	\N	1937-06-01	\N
4	Aamir Khan	\N	1965-03-14	\N
5	Shah Rukh Khan	\N	1965-11-02	\N
6	Priyanka Chopra	\N	1982-07-18	\N
7	Rajkumar Hirani	\N	1962-11-20	\N
8	Greta Gerwig	\N	1983-08-04	\N
9	Margot Robbie	\N	1990-07-02	\N
10	Ryan Gosling	\N	1980-11-12	\N
11	Ranveer Singh	\N	1985-07-06	\N
12	Deepika Padukone	\N	1986-01-05	\N
13	Ranbir Kapoor	\N	1982-09-28	\N
14	Alia Bhatt	\N	1993-03-15	\N
15	Hrithik Roshan	\N	1974-01-10	\N
16	Katrina Kaif	\N	1983-07-16	\N
17	Akshay Kumar	\N	1967-09-09	\N
18	Salman Khan	\N	1965-12-27	\N
19	Vidya Balan	\N	1979-01-01	\N
20	Kangana Ranaut	\N	1987-03-23	\N
21	Ayushmann Khurrana	\N	1984-09-14	\N
22	Rajkummar Rao	\N	1984-08-31	\N
23	Vicky Kaushal	\N	1988-05-16	\N
24	Kiara Advani	\N	1992-07-31	\N
25	Sanya Malhotra	\N	1992-02-25	\N
26	Kartik Aaryan	\N	1990-11-22	\N
27	Sara Ali Khan	\N	1995-08-12	\N
28	Ananya Panday	\N	1998-10-30	\N
29	Janhvi Kapoor	\N	1997-03-06	\N
30	Ishaan Khatter	\N	1995-11-01	\N
31	Taapsee Pannu	\N	1987-08-01	\N
32	Bhumi Pednekar	\N	1989-07-18	\N
33	Kriti Sanon	\N	1990-07-27	\N
34	Shraddha Kapoor	\N	1987-03-03	\N
35	Varun Dhawan	\N	1987-04-24	\N
36	Tiger Shroff	\N	1990-03-02	\N
37	Disha Patani	\N	1992-06-13	\N
38	Sidharth Malhotra	\N	1985-01-16	\N
39	Parineeti Chopra	\N	1988-10-22	\N
40	Sonakshi Sinha	\N	1987-06-02	\N
41	Tom Hanks	\N	1956-07-09	\N
42	Meryl Streep	\N	1949-06-22	\N
43	Robert De Niro	\N	1943-08-17	\N
44	Brad Pitt	\N	1963-12-18	\N
45	Angelina Jolie	\N	1975-06-04	\N
46	Johnny Depp	\N	1963-06-09	\N
47	Scarlett Johansson	\N	1984-11-22	\N
48	Chris Hemsworth	\N	1983-08-11	\N
49	Chris Evans	\N	1981-06-13	\N
50	Robert Downey Jr.	\N	1965-04-04	\N
51	Mark Ruffalo	\N	1967-11-22	\N
52	Chris Pratt	\N	1979-06-21	\N
53	Zendaya	\N	1996-09-01	\N
54	Tom Holland	\N	1996-06-01	\N
55	TimothΓÇÜe Chalamet	\N	1995-12-27	\N
56	Florence Pugh	\N	1996-01-03	\N
57	Saoirse Ronan	\N	1994-04-12	\N
58	Emma Stone	\N	1988-11-06	\N
59	Jennifer Lawrence	\N	1990-08-15	\N
60	Anne Hathaway	\N	1982-11-12	\N
61	Christian Bale	\N	1974-01-30	\N
62	Matthew McConaughey	\N	1969-11-04	\N
63	Jake Gyllenhaal	\N	1980-12-19	\N
64	Ryan Reynolds	\N	1976-10-23	\N
65	Hugh Jackman	\N	1968-10-12	\N
66	Benedict Cumberbatch	\N	1976-07-19	\N
67	Tom Cruise	\N	1962-07-03	\N
68	Will Smith	\N	1968-09-25	\N
69	Denzel Washington	\N	1954-12-28	\N
70	Samuel L. Jackson	\N	1948-12-21	\N
71	Steven Spielberg	\N	1946-12-18	\N
72	Martin Scorsese	\N	1942-11-17	\N
73	Quentin Tarantino	\N	1963-03-27	\N
74	James Cameron	\N	1954-08-16	\N
75	Denis Villeneuve	\N	1967-10-03	\N
76	Ridley Scott	\N	1937-11-30	\N
77	David Fincher	\N	1962-08-28	\N
78	Wes Anderson	\N	1969-05-01	\N
79	Guillermo del Toro	\N	1964-10-09	\N
80	Alfonso Cuar┬ón	\N	1961-11-28	\N
81	S.S. Rajamouli	\N	1973-10-10	\N
82	Sanjay Leela Bhansali	\N	1963-02-24	\N
83	Zoya Akhtar	\N	1972-10-14	\N
84	Anurag Kashyap	\N	1972-09-10	\N
85	Imtiaz Ali	\N	1971-06-16	\N
86	Vishal Bhardwaj	\N	1965-08-04	\N
87	Rakeysh Omprakash Mehra	\N	1963-07-07	\N
88	Rohit Shetty	\N	1973-03-14	\N
89	Karan Johar	\N	1972-05-25	\N
90	Farah Khan	\N	1965-01-09	\N
91	Hans Zimmer	\N	1957-09-12	\N
92	A.R. Rahman	\N	1967-01-06	\N
93	John Williams	\N	1932-02-08	\N
94	Danny Elfman	\N	1953-05-29	\N
95	Howard Shore	\N	1946-10-18	\N
96	Cate Blanchett	\N	1969-05-14	\N
97	Natalie Portman	\N	1981-06-09	\N
98	Amy Adams	\N	1974-08-20	\N
99	Emily Blunt	\N	1983-02-23	\N
100	Charlize Theron	\N	1975-08-07	\N
101	Nicole Kidman	\N	1967-06-20	\N
102	Viola Davis	\N	1965-08-11	\N
103	Lupita Nyongo	\N	1983-03-01	\N
104	Gal Gadot	\N	1985-04-30	\N
105	Brie Larson	\N	1989-10-01	\N
106	Keanu Reeves	\N	1964-09-02	\N
107	Matt Damon	\N	1970-10-08	\N
108	George Clooney	\N	1961-05-06	\N
109	Colin Firth	\N	1960-09-10	\N
110	Daniel Craig	\N	1968-03-02	\N
111	Ranveer Singh	\N	1985-07-06	\N
112	Deepika Padukone	\N	1986-01-05	\N
113	Ranbir Kapoor	\N	1982-09-28	\N
114	Alia Bhatt	\N	1993-03-15	\N
115	Hrithik Roshan	\N	1974-01-10	\N
116	Katrina Kaif	\N	1983-07-16	\N
117	Akshay Kumar	\N	1967-09-09	\N
118	Salman Khan	\N	1965-12-27	\N
119	Vidya Balan	\N	1979-01-01	\N
120	Kangana Ranaut	\N	1987-03-23	\N
121	Ayushmann Khurrana	\N	1984-09-14	\N
122	Rajkummar Rao	\N	1984-08-31	\N
123	Vicky Kaushal	\N	1988-05-16	\N
124	Kiara Advani	\N	1992-07-31	\N
125	Sanya Malhotra	\N	1992-02-25	\N
126	Kartik Aaryan	\N	1990-11-22	\N
127	Sara Ali Khan	\N	1995-08-12	\N
128	Ananya Panday	\N	1998-10-30	\N
129	Janhvi Kapoor	\N	1997-03-06	\N
130	Ishaan Khatter	\N	1995-11-01	\N
131	Taapsee Pannu	\N	1987-08-01	\N
132	Bhumi Pednekar	\N	1989-07-18	\N
133	Kriti Sanon	\N	1990-07-27	\N
134	Shraddha Kapoor	\N	1987-03-03	\N
135	Varun Dhawan	\N	1987-04-24	\N
136	Tiger Shroff	\N	1990-03-02	\N
137	Disha Patani	\N	1992-06-13	\N
138	Sidharth Malhotra	\N	1985-01-16	\N
139	Parineeti Chopra	\N	1988-10-22	\N
140	Sonakshi Sinha	\N	1987-06-02	\N
141	Tom Hanks	\N	1956-07-09	\N
142	Meryl Streep	\N	1949-06-22	\N
143	Robert De Niro	\N	1943-08-17	\N
144	Brad Pitt	\N	1963-12-18	\N
145	Angelina Jolie	\N	1975-06-04	\N
150	Robert Downey Jr.	\N	1965-04-04	\N
151	Mark Ruffalo	\N	1967-11-22	\N
152	Chris Pratt	\N	1979-06-21	\N
153	Zendaya	\N	1996-09-01	\N
154	Tom Holland	\N	1996-06-01	\N
155	TimothΓÇÜe Chalamet	\N	1995-12-27	\N
156	Florence Pugh	\N	1996-01-03	\N
157	Saoirse Ronan	\N	1994-04-12	\N
158	Emma Stone	\N	1988-11-06	\N
159	Jennifer Lawrence	\N	1990-08-15	\N
160	Anne Hathaway	\N	1982-11-12	\N
161	Christian Bale	\N	1974-01-30	\N
162	Matthew McConaughey	\N	1969-11-04	\N
163	Jake Gyllenhaal	\N	1980-12-19	\N
164	Ryan Reynolds	\N	1976-10-23	\N
165	Hugh Jackman	\N	1968-10-12	\N
166	Benedict Cumberbatch	\N	1976-07-19	\N
167	Tom Cruise	\N	1962-07-03	\N
168	Will Smith	\N	1968-09-25	\N
169	Denzel Washington	\N	1954-12-28	\N
170	Samuel L. Jackson	\N	1948-12-21	\N
171	Steven Spielberg	\N	1946-12-18	\N
172	Martin Scorsese	\N	1942-11-17	\N
173	Quentin Tarantino	\N	1963-03-27	\N
174	James Cameron	\N	1954-08-16	\N
175	Denis Villeneuve	\N	1967-10-03	\N
176	Ridley Scott	\N	1937-11-30	\N
177	David Fincher	\N	1962-08-28	\N
178	Wes Anderson	\N	1969-05-01	\N
179	Guillermo del Toro	\N	1964-10-09	\N
180	Alfonso Cuar┬ón	\N	1961-11-28	\N
181	S.S. Rajamouli	\N	1973-10-10	\N
182	Sanjay Leela Bhansali	\N	1963-02-24	\N
183	Zoya Akhtar	\N	1972-10-14	\N
184	Anurag Kashyap	\N	1972-09-10	\N
185	Imtiaz Ali	\N	1971-06-16	\N
186	Vishal Bhardwaj	\N	1965-08-04	\N
187	Rakeysh Omprakash Mehra	\N	1963-07-07	\N
188	Rohit Shetty	\N	1973-03-14	\N
189	Karan Johar	\N	1972-05-25	\N
190	Farah Khan	\N	1965-01-09	\N
191	Hans Zimmer	\N	1957-09-12	\N
192	A.R. Rahman	\N	1967-01-06	\N
193	John Williams	\N	1932-02-08	\N
194	Danny Elfman	\N	1953-05-29	\N
195	Howard Shore	\N	1946-10-18	\N
196	Cate Blanchett	\N	1969-05-14	\N
197	Natalie Portman	\N	1981-06-09	\N
198	Amy Adams	\N	1974-08-20	\N
199	Emily Blunt	\N	1983-02-23	\N
200	Charlize Theron	\N	1975-08-07	\N
201	Nicole Kidman	\N	1967-06-20	\N
202	Viola Davis	\N	1965-08-11	\N
203	Lupita Nyongo	\N	1983-03-01	\N
204	Gal Gadot	\N	1985-04-30	\N
205	Brie Larson	\N	1989-10-01	\N
206	Keanu Reeves	\N	1964-09-02	\N
207	Matt Damon	\N	1970-10-08	\N
208	George Clooney	\N	1961-05-06	\N
209	Colin Firth	\N	1960-09-10	\N
210	Daniel Craig	\N	1968-03-02	\N
211	Sofia Coppola	A prominent figure in the film industry with a career spanning over 11 years.	1955-02-06	\N
212	Pedro Almodovar	A prominent figure in the film industry with a career spanning over 20 years.	1994-06-06	\N
213	Sofia Coppola	A prominent figure in the film industry with a career spanning over 22 years.	1973-03-04	\N
214	Sofia Coppola	A prominent figure in the film industry with a career spanning over 14 years.	1955-12-27	\N
215	Sofia Coppola	A prominent figure in the film industry with a career spanning over 37 years.	1959-07-14	\N
216	Sofia Coppola	A prominent figure in the film industry with a career spanning over 23 years.	1975-08-11	\N
217	Robert De Niro	A prominent figure in the film industry with a career spanning over 21 years.	1973-03-17	\N
218	Christian Bale	A prominent figure in the film industry with a career spanning over 13 years.	2000-10-01	\N
219	Scarlett Johansson	A prominent figure in the film industry with a career spanning over 31 years.	1998-05-28	\N
220	Denis Villeneuve	A prominent figure in the film industry with a career spanning over 39 years.	1984-02-07	\N
221	Christopher Nolan	A prominent figure in the film industry with a career spanning over 17 years.	1989-05-09	\N
222	Leonardo DiCaprio	A prominent figure in the film industry with a career spanning over 17 years.	1958-08-27	\N
223	Scarlett Johansson	A prominent figure in the film industry with a career spanning over 11 years.	1999-12-07	\N
224	Daniel Day-Lewis	A prominent figure in the film industry with a career spanning over 27 years.	1961-10-19	\N
225	Olivia Colman	A prominent figure in the film industry with a career spanning over 10 years.	1968-06-07	\N
226	Joaquin Phoenix	A prominent figure in the film industry with a career spanning over 10 years.	1966-04-09	\N
227	Christopher Nolan	A prominent figure in the film industry with a career spanning over 21 years.	1982-05-06	\N
228	Daniel Day-Lewis	A prominent figure in the film industry with a career spanning over 6 years.	1953-06-10	\N
229	Jordan Peele	A prominent figure in the film industry with a career spanning over 15 years.	1963-12-04	\N
230	Mahershala Ali	A prominent figure in the film industry with a career spanning over 27 years.	1971-11-09	\N
231	Tom Hanks	A prominent figure in the film industry with a career spanning over 26 years.	1972-05-26	\N
232	Robert De Niro	A prominent figure in the film industry with a career spanning over 32 years.	1985-09-06	\N
233	Cate Blanchett	A prominent figure in the film industry with a career spanning over 36 years.	1979-03-02	\N
234	Robert De Niro	A prominent figure in the film industry with a career spanning over 35 years.	1962-03-11	\N
235	Meryl Streep	A prominent figure in the film industry with a career spanning over 8 years.	1989-09-05	\N
236	Chloe Zhao	A prominent figure in the film industry with a career spanning over 31 years.	1982-11-04	\N
237	Joaquin Phoenix	A prominent figure in the film industry with a career spanning over 38 years.	1985-11-27	\N
238	Emma Stone	A prominent figure in the film industry with a career spanning over 6 years.	1986-07-18	\N
239	Wes Anderson	A prominent figure in the film industry with a career spanning over 12 years.	1971-05-27	\N
240	Wes Anderson	A prominent figure in the film industry with a career spanning over 35 years.	1982-11-15	\N
241	Viola Davis	A prominent figure in the film industry with a career spanning over 13 years.	1955-11-07	\N
242	Leonardo DiCaprio	A prominent figure in the film industry with a career spanning over 29 years.	1962-08-16	\N
243	Wes Anderson	A prominent figure in the film industry with a career spanning over 8 years.	1996-07-06	\N
244	Tom Hanks	A prominent figure in the film industry with a career spanning over 34 years.	2000-02-20	\N
245	Taika Waititi	A prominent figure in the film industry with a career spanning over 26 years.	1959-07-23	\N
246	Jessica Chastain	A prominent figure in the film industry with a career spanning over 24 years.	1988-11-05	\N
247	Meryl Streep	A prominent figure in the film industry with a career spanning over 15 years.	1978-11-19	\N
248	Mahershala Ali	A prominent figure in the film industry with a career spanning over 40 years.	1986-07-10	\N
249	Jessica Chastain	A prominent figure in the film industry with a career spanning over 7 years.	1974-05-03	\N
250	Pedro Almodovar	A prominent figure in the film industry with a career spanning over 24 years.	1960-06-27	\N
251	Jordan Peele	A prominent figure in the film industry with a career spanning over 35 years.	1990-11-10	\N
252	Taika Waititi	A prominent figure in the film industry with a career spanning over 24 years.	1978-12-16	\N
253	Jessica Chastain	A prominent figure in the film industry with a career spanning over 19 years.	1996-08-10	\N
254	Viola Davis	A prominent figure in the film industry with a career spanning over 6 years.	1961-09-17	\N
255	Christian Bale	A prominent figure in the film industry with a career spanning over 39 years.	1975-10-22	\N
256	Saoirse Ronan	A prominent figure in the film industry with a career spanning over 13 years.	1992-07-13	\N
257	Taika Waititi	A prominent figure in the film industry with a career spanning over 6 years.	1950-12-11	\N
258	Leonardo DiCaprio	A prominent figure in the film industry with a career spanning over 14 years.	1981-09-04	\N
259	Amy Adams	A prominent figure in the film industry with a career spanning over 16 years.	1960-12-17	\N
260	Sofia Coppola	A prominent figure in the film industry with a career spanning over 22 years.	1966-08-09	\N
261	Taika Waititi	A prominent figure in the film industry with a career spanning over 14 years.	1984-01-10	\N
262	Jessica Chastain	A prominent figure in the film industry with a career spanning over 26 years.	1963-08-20	\N
263	Emma Stone	A prominent figure in the film industry with a career spanning over 16 years.	1952-05-04	\N
264	Olivia Colman	A prominent figure in the film industry with a career spanning over 22 years.	1973-12-27	\N
265	Sofia Coppola	A prominent figure in the film industry with a career spanning over 22 years.	1998-09-21	\N
266	Brad Pitt	A prominent figure in the film industry with a career spanning over 14 years.	1991-07-10	\N
267	Jessica Chastain	A prominent figure in the film industry with a career spanning over 16 years.	1999-08-24	\N
268	Joaquin Phoenix	A prominent figure in the film industry with a career spanning over 10 years.	1989-12-27	\N
269	Scarlett Johansson	A prominent figure in the film industry with a career spanning over 35 years.	1954-08-22	\N
270	Denzel Washington	A prominent figure in the film industry with a career spanning over 15 years.	1972-06-12	\N
271	Scarlett Johansson	A prominent figure in the film industry with a career spanning over 14 years.	1969-03-14	\N
272	Pedro Almodovar	A prominent figure in the film industry with a career spanning over 23 years.	1994-06-02	\N
273	Chloe Zhao	A prominent figure in the film industry with a career spanning over 12 years.	1995-03-08	\N
274	Mahershala Ali	A prominent figure in the film industry with a career spanning over 24 years.	1979-07-14	\N
275	Amy Adams	A prominent figure in the film industry with a career spanning over 30 years.	1961-12-25	\N
276	Jordan Peele	A prominent figure in the film industry with a career spanning over 14 years.	1977-01-22	\N
277	Saoirse Ronan	A prominent figure in the film industry with a career spanning over 23 years.	1987-12-19	\N
278	Robert De Niro	A prominent figure in the film industry with a career spanning over 30 years.	1954-08-05	\N
279	Denis Villeneuve	A prominent figure in the film industry with a career spanning over 24 years.	1955-12-16	\N
280	Scarlett Johansson	A prominent figure in the film industry with a career spanning over 34 years.	1983-02-08	\N
281	Jordan Peele	A prominent figure in the film industry with a career spanning over 19 years.	1954-10-01	\N
282	Emma Stone	A prominent figure in the film industry with a career spanning over 10 years.	1957-09-25	\N
283	Cate Blanchett	A prominent figure in the film industry with a career spanning over 37 years.	1974-11-15	\N
284	Olivia Colman	A prominent figure in the film industry with a career spanning over 23 years.	1950-10-07	\N
285	Wes Anderson	A prominent figure in the film industry with a career spanning over 10 years.	1996-02-04	\N
286	Cate Blanchett	A prominent figure in the film industry with a career spanning over 10 years.	1980-08-10	\N
287	Tom Hanks	A prominent figure in the film industry with a career spanning over 22 years.	1964-11-03	\N
288	Christian Bale	A prominent figure in the film industry with a career spanning over 29 years.	2000-04-06	\N
289	Chloe Zhao	A prominent figure in the film industry with a career spanning over 11 years.	1980-05-11	\N
290	Christian Bale	A prominent figure in the film industry with a career spanning over 22 years.	1993-07-11	\N
291	Olivia Colman	A prominent figure in the film industry with a career spanning over 5 years.	1967-11-22	\N
292	Park Chan-wook	A prominent figure in the film industry with a career spanning over 29 years.	1993-06-11	\N
293	Olivia Colman	A prominent figure in the film industry with a career spanning over 37 years.	1976-10-21	\N
294	Brad Pitt	A prominent figure in the film industry with a career spanning over 22 years.	1957-12-17	\N
295	Pedro Almodovar	A prominent figure in the film industry with a career spanning over 13 years.	1953-03-27	\N
296	Joaquin Phoenix	A prominent figure in the film industry with a career spanning over 35 years.	1964-12-01	\N
297	Emma Stone	A prominent figure in the film industry with a career spanning over 8 years.	1973-06-12	\N
298	Robert De Niro	A prominent figure in the film industry with a career spanning over 9 years.	1987-05-20	\N
299	Meryl Streep	A prominent figure in the film industry with a career spanning over 35 years.	1991-07-01	\N
300	Greta Gerwig	A prominent figure in the film industry with a career spanning over 27 years.	1951-04-20	\N
301	Olivia Colman	A prominent figure in the film industry with a career spanning over 25 years.	1960-02-08	\N
302	Mahershala Ali	A prominent figure in the film industry with a career spanning over 6 years.	1954-07-17	\N
303	Pedro Almodovar	A prominent figure in the film industry with a career spanning over 22 years.	1970-06-03	\N
304	Greta Gerwig	A prominent figure in the film industry with a career spanning over 7 years.	1991-05-01	\N
305	Denis Villeneuve	A prominent figure in the film industry with a career spanning over 33 years.	1997-02-09	\N
306	Saoirse Ronan	A prominent figure in the film industry with a career spanning over 33 years.	1987-03-21	\N
307	Wes Anderson	A prominent figure in the film industry with a career spanning over 33 years.	1956-12-11	\N
308	Greta Gerwig	A prominent figure in the film industry with a career spanning over 36 years.	1992-05-08	\N
309	Frances McDormand	A prominent figure in the film industry with a career spanning over 9 years.	1990-12-21	\N
310	Frances McDormand	A prominent figure in the film industry with a career spanning over 32 years.	1967-09-09	\N
\.


--
-- Data for Name: platform; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform (platform_id, platform_name, platform_type, logo_url) FROM stdin;
1	Netflix	OTT	\N
2	Amazon Prime Video	OTT	\N
3	Disney+	OTT	\N
4	Apple TV+	OTT	\N
5	HBO Max	OTT	\N
6	Theatrical	Theatrical	\N
7	Hotstar	OTT	\N
8	Sony LIV	OTT	\N
9	Zee5	OTT	\N
\.


--
-- Data for Name: review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review (review_id, media_id, user_id, rating, review_text, review_date, created_at) FROM stdin;
1	1	2	9.0	Mind-bending masterpiece! Christopher Nolan at his best. The dream sequences are executed perfectly.	2023-05-15	2026-02-04 20:04:08.753086
2	1	3	8.5	Brilliant concept with stunning visuals. A bit complex on first watch but totally worth it.	2023-06-20	2026-02-04 20:04:08.753086
3	1	4	9.5	One of the best sci-fi movies ever made. Hans Zimmer's score is phenomenal.	2023-07-10	2026-02-04 20:04:08.753086
4	2	2	8.5	Hilarious and touching at the same time. Great message about education system.	2023-04-12	2026-02-04 20:04:16.708916
5	2	4	9.0	Best Bollywood movie! Makes you laugh and cry. Aamir Khan is brilliant.	2023-05-01	2026-02-04 20:04:16.708916
6	3	2	10.0	Heath Ledger's Joker is iconic. Perfect superhero movie.	2023-03-15	2026-02-04 20:04:21.001544
7	3	3	9.5	Dark, intense, and gripping. Best Batman movie ever made.	2023-04-20	2026-02-04 20:04:21.001544
8	3	4	9.0	Heath Ledger deserved the Oscar. Masterful performance.	2023-05-05	2026-02-04 20:04:21.001544
9	6	2	10.0	The greatest TV series ever created. Walter White's transformation is incredible.	2023-08-10	2026-02-04 20:04:32.372867
10	6	3	9.5	Flawless from start to finish. Every episode is a masterpiece.	2023-08-25	2026-02-04 20:04:32.372867
11	6	4	9.8	Bryan Cranston and Aaron Paul are phenomenal. Cannot recommend enough.	2023-09-01	2026-02-04 20:04:32.372867
12	7	2	8.5	Nostalgia done right! Great 80s vibes and lovable characters.	2023-07-15	2026-02-04 20:04:38.095293
13	7	4	8.0	Fun and entertaining. Kids cast is amazing.	2023-07-20	2026-02-04 20:04:38.095293
14	8	2	8.8	Best Indian web series! Gritty, intense, and brilliantly acted.	2023-06-10	2026-02-04 20:04:45.179247
15	8	4	9.0	Nawazuddin Siddiqui is phenomenal. Keeps you hooked till the end.	2023-06-25	2026-02-04 20:04:45.179247
16	1	5	5.0	Mind-bending masterpiece! Nolan at his finest.	2026-02-04	2026-02-04 21:30:59.169468
17	1	7	4.0	Great concept but a bit confusing at times.	2026-02-04	2026-02-04 21:30:59.169468
18	1	9	5.0	Absolutely brilliant. Watched it three times!	2026-02-04	2026-02-04 21:30:59.169468
19	1	11	5.0	The cinematography and score are phenomenal.	2026-02-04	2026-02-04 21:30:59.169468
20	1	13	4.0	Clever storytelling, though the ending is ambiguous.	2026-02-04	2026-02-04 21:30:59.169468
21	1	15	5.0	One of the best sci-fi films ever made.	2026-02-04	2026-02-04 21:30:59.169468
22	1	17	4.0	Loved the visuals and action sequences.	2026-02-04	2026-02-04 21:30:59.169468
23	1	19	5.0	DiCaprio delivers an outstanding performance.	2026-02-04	2026-02-04 21:30:59.169468
24	1	21	4.0	Complex narrative that requires full attention.	2026-02-04	2026-02-04 21:30:59.169468
25	1	23	5.0	The dream within a dream concept is genius.	2026-02-04	2026-02-04 21:30:59.169468
26	7	7	5.0	Nostalgic 80s vibes with amazing storytelling!	2026-02-04	2026-02-04 21:30:59.1869
27	7	9	4.0	Love the kids cast. Season 1 was the best.	2026-02-04	2026-02-04 21:30:59.1869
28	7	11	5.0	Perfect mix of horror, sci-fi, and coming-of-age.	2026-02-04	2026-02-04 21:30:59.1869
29	7	13	4.0	The Upside Down concept is fascinating.	2026-02-04	2026-02-04 21:30:59.1869
30	7	15	5.0	Millie Bobby Brown is phenomenal as Eleven.	2026-02-04	2026-02-04 21:30:59.1869
31	7	17	4.0	Great soundtrack and cinematography.	2026-02-04	2026-02-04 21:30:59.1869
32	7	19	5.0	Binged all seasons in a week!	2026-02-04	2026-02-04 21:30:59.1869
33	7	21	4.0	Gets better with each season.	2026-02-04	2026-02-04 21:30:59.1869
34	7	23	5.0	The Duffer Brothers created something special.	2026-02-04	2026-02-04 21:30:59.1869
35	7	25	4.0	Demogorgons are terrifying!	2026-02-04	2026-02-04 21:30:59.1869
53	3	10	9.0	Absolutely brilliant film, Heath Ledger is iconic.	2026-02-18	2026-02-18 21:49:46.120261
56	5	7	9.0	Trigger Test 2	2026-03-18	2026-03-18 05:17:23.664737
57	5	8	10.0	Trigger Test 3	2026-03-18	2026-03-18 05:17:50.113145
58	16	1	10.0	1	2026-03-18	2026-03-18 15:03:21.476888
61	1	1	5.0	yyeah bad	2026-03-18	2026-03-18 15:06:19.691558
63	4	1	10.0	berb	2026-03-18	2026-03-18 15:21:35.704496
64	3	1	8.0	yeah sex	2026-03-18	2026-03-18 16:06:42.797528
65	10	1	9.0	Yeah great show with some great dragons	2026-03-18	2026-03-18 16:23:16.590403
66	113	1	8.5	Yeah blade running very nice	2026-03-18	2026-03-18 16:48:01.73797
68	7	205	6.7	last season was pretty shit	2026-04-07	2026-04-06 19:48:17.753342
\.


--
-- Data for Name: review_like; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_like (review_id, user_id, liked_at) FROM stdin;
1	3	2026-02-04 20:04:51.835944
4	3	2026-02-04 20:04:51.835944
7	3	2026-02-04 20:04:51.835944
1	4	2026-02-04 20:04:51.84377
2	4	2026-02-04 20:04:51.84377
10	4	2026-02-04 20:04:51.84377
2	2	2026-02-04 20:04:51.846381
8	2	2026-02-04 20:04:51.846381
\.


--
-- Data for Name: screen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.screen (screen_id, cinema_id, screen_name, total_seats, screen_type) FROM stdin;
1	1	Screen 1	120	Standard
2	1	Screen 2	150	Dolby Atmos
3	1	IMAX Hall	250	IMAX
4	2	Audi 1	100	Standard
5	2	Audi 2	130	Standard
6	2	Audi 3	180	Dolby Atmos
7	2	Gold Class	60	4DX
8	3	Screen A	140	Standard
9	3	Screen B	160	Dolby Atmos
10	3	IMAX Screen	280	IMAX
11	4	Hall 1	110	Standard
12	4	Hall 2	150	Dolby Atmos
13	5	Screen 1	200	IMAX
14	5	Screen 2	120	Standard
15	6	Insignia 1	80	4DX
16	6	Insignia 2	100	Dolby Atmos
\.


--
-- Data for Name: season; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.season (season_id, media_id, season_number, release_date, total_episodes) FROM stdin;
1	6	1	2008-01-20	7
2	6	2	2009-03-08	13
3	6	3	2010-03-21	13
4	6	4	2011-07-17	13
5	6	5	2012-07-15	16
6	7	1	2016-07-15	8
7	7	2	2017-10-27	9
8	7	3	2019-07-04	8
9	7	4	2022-05-27	9
10	8	1	2018-07-06	8
11	8	2	2019-08-15	8
12	9	1	2011-04-17	10
13	9	2	2012-04-01	10
14	10	1	2022-08-21	10
15	10	2	2024-06-16	8
16	11	1	2018-11-16	9
17	11	2	2020-10-23	10
18	11	3	2024-07-05	10
19	12	1	2016-11-04	10
20	12	2	2017-12-08	10
21	12	3	2019-11-17	10
22	12	4	2020-11-15	10
23	12	5	2022-11-09	10
24	12	6	2023-11-16	10
\.


--
-- Data for Name: showing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.showing (showing_id, media_id, screen_id, show_date, show_time, available_seats, price) FROM stdin;
4	1	1	2026-02-05	21:30:00	80	350.00
6	1	3	2026-02-05	19:00:00	220	650.00
8	3	4	2026-02-05	16:00:00	90	320.00
9	3	4	2026-02-05	20:00:00	70	380.00
10	3	7	2026-02-05	17:00:00	55	800.00
12	5	8	2026-02-05	10:30:00	140	250.00
14	5	8	2026-02-05	17:30:00	120	350.00
15	5	8	2026-02-05	21:00:00	100	350.00
17	5	10	2026-02-05	18:00:00	250	600.00
18	2	11	2026-02-05	11:00:00	110	200.00
20	2	11	2026-02-05	19:00:00	90	300.00
21	4	13	2026-02-05	12:00:00	200	280.00
22	4	13	2026-02-05	16:30:00	190	320.00
25	1	1	2026-02-06	13:30:00	120	350.00
26	1	1	2026-02-06	17:00:00	120	400.00
27	1	1	2026-02-06	20:30:00	120	400.00
28	3	4	2026-02-06	11:00:00	100	320.00
29	3	4	2026-02-06	15:00:00	100	380.00
30	3	4	2026-02-06	19:00:00	100	420.00
31	5	10	2026-02-06	14:00:00	280	650.00
32	5	10	2026-02-06	19:00:00	280	700.00
11	3	7	2026-02-05	21:00:00	48	900.00
16	5	10	2026-02-05	13:00:00	267	550.00
19	2	11	2026-02-05	15:00:00	104	250.00
5	1	3	2026-02-05	15:00:00	242	600.00
13	5	8	2026-02-05	14:00:00	126	300.00
3	1	1	2026-02-05	18:00:00	95	350.00
23	4	13	2026-02-05	20:30:00	168	350.00
7	3	4	2026-02-05	12:00:00	95	280.00
2	1	1	2026-02-05	14:30:00	115	300.00
24	1	1	2026-02-06	10:00:00	120	300.00
1	1	1	2026-02-05	11:00:00	0	250.00
\.


--
-- Data for Name: tv_show; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tv_show (media_id, total_seasons, status) FROM stdin;
6	5	completed
7	4	ongoing
8	2	completed
9	8	completed
10	2	ongoing
11	3	ongoing
12	6	completed
13	0	upcoming
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, email, region, password_hash, preferred_language, is_verified, role, created_at) FROM stdin;
1	Admin User	admin@showboxd.com	India	$2b$10$abcdefghijklmnopqrstuvwxyz	English	t	admin	2026-02-04 14:25:31.199927
2	Rajesh Kumar	rajesh@example.com	India	$2b$10$hash123456	Hindi	f	user	2026-02-04 14:25:31.199927
3	Sarah Johnson	sarah@example.com	USA	$2b$10$hash789012	English	t	user	2026-02-04 14:25:31.199927
4	Priya Sharma	priya@example.com	India	$2b$10$hash345678	English	f	user	2026-02-04 14:25:31.199927
5	Amit Patel	amit.patel@email.com	India	$2b$10$hash001	Hindi	f	user	2026-02-04 21:30:59.037654
6	Jennifer Lee	jennifer.lee@email.com	USA	$2b$10$hash002	English	t	user	2026-02-04 21:30:59.037654
7	Rahul Verma	rahul.verma@email.com	India	$2b$10$hash003	Hindi	f	user	2026-02-04 21:30:59.037654
8	Emily Chen	emily.chen@email.com	USA	$2b$10$hash004	English	f	user	2026-02-04 21:30:59.037654
9	Vikram Singh	vikram.singh@email.com	India	$2b$10$hash005	Punjabi	f	user	2026-02-04 21:30:59.037654
10	David Miller	david.miller@email.com	UK	$2b$10$hash006	English	t	user	2026-02-04 21:30:59.037654
11	Sneha Gupta	sneha.gupta@email.com	India	$2b$10$hash007	Hindi	f	user	2026-02-04 21:30:59.037654
12	Michael Brown	michael.brown@email.com	USA	$2b$10$hash008	English	f	user	2026-02-04 21:30:59.037654
13	Ananya Reddy	ananya.reddy@email.com	India	$2b$10$hash009	Telugu	f	user	2026-02-04 21:30:59.037654
14	Jessica Davis	jessica.davis@email.com	USA	$2b$10$hash010	English	t	user	2026-02-04 21:30:59.037654
15	Rohan Malhotra	rohan.malhotra@email.com	India	$2b$10$hash011	Hindi	f	user	2026-02-04 21:30:59.037654
16	Sophie Taylor	sophie.taylor@email.com	UK	$2b$10$hash012	English	f	user	2026-02-04 21:30:59.037654
17	Arjun Kapoor	arjun.kapoor@email.com	India	$2b$10$hash013	Hindi	f	user	2026-02-04 21:30:59.037654
18	Laura Wilson	laura.wilson@email.com	Canada	$2b$10$hash014	English	f	user	2026-02-04 21:30:59.037654
19	Karan Mehta	karan.mehta@email.com	India	$2b$10$hash015	Gujarati	f	user	2026-02-04 21:30:59.037654
20	Emma Thompson	emma.thompson@email.com	UK	$2b$10$hash016	English	t	user	2026-02-04 21:30:59.037654
21	Aditya Joshi	aditya.joshi@email.com	India	$2b$10$hash017	Marathi	f	user	2026-02-04 21:30:59.037654
22	Olivia Martin	olivia.martin@email.com	Australia	$2b$10$hash018	English	f	user	2026-02-04 21:30:59.037654
23	Nikhil Sharma	nikhil.sharma@email.com	India	$2b$10$hash019	Hindi	f	user	2026-02-04 21:30:59.037654
24	Sophia Anderson	sophia.anderson@email.com	USA	$2b$10$hash020	English	f	user	2026-02-04 21:30:59.037654
25	Varun Kumar	varun.kumar@email.com	India	$2b$10$hash021	Tamil	f	user	2026-02-04 21:30:59.037654
27	Siddharth Rao	siddharth.rao@email.com	India	$2b$10$hash023	Kannada	f	user	2026-02-04 21:30:59.037654
28	Charlotte Harris	charlotte.harris@email.com	UK	$2b$10$hash024	English	f	user	2026-02-04 21:30:59.037654
29	Akash Bansal	akash.bansal@email.com	India	$2b$10$hash025	Hindi	f	user	2026-02-04 21:30:59.037654
30	Mia Robinson	mia.robinson@email.com	Canada	$2b$10$hash026	English	f	user	2026-02-04 21:30:59.037654
31	Harsh Agarwal	harsh.agarwal@email.com	India	$2b$10$hash027	Hindi	f	user	2026-02-04 21:30:59.037654
32	Amelia Clark	amelia.clark@email.com	USA	$2b$10$hash028	English	f	user	2026-02-04 21:30:59.037654
33	Ritesh Desai	ritesh.desai@email.com	India	$2b$10$hash029	Gujarati	f	user	2026-02-04 21:30:59.037654
34	Ella Lewis	ella.lewis@email.com	UK	$2b$10$hash030	English	t	user	2026-02-04 21:30:59.037654
35	Mohit Saxena	mohit.saxena@email.com	India	$2b$10$hash031	Hindi	f	user	2026-02-04 21:30:59.037654
36	Ava Walker	ava.walker@email.com	Australia	$2b$10$hash032	English	f	user	2026-02-04 21:30:59.037654
37	Gaurav Pandey	gaurav.pandey@email.com	India	$2b$10$hash033	Hindi	f	user	2026-02-04 21:30:59.037654
38	Harper Young	harper.young@email.com	USA	$2b$10$hash034	English	f	user	2026-02-04 21:30:59.037654
39	Abhishek Nair	abhishek.nair@email.com	India	$2b$10$hash035	Malayalam	f	user	2026-02-04 21:30:59.037654
40	Evelyn King	evelyn.king@email.com	USA	$2b$10$hash036	English	f	user	2026-02-04 21:30:59.037654
41	Tanmay Bhatt	tanmay.bhatt@email.com	India	$2b$10$hash037	Hindi	f	user	2026-02-04 21:30:59.037654
42	Abigail Wright	abigail.wright@email.com	Canada	$2b$10$hash038	English	f	user	2026-02-04 21:30:59.037654
43	Pranav Iyer	pranav.iyer@email.com	India	$2b$10$hash039	Tamil	f	user	2026-02-04 21:30:59.037654
44	Emily Green	emily.green@email.com	UK	$2b$10$hash040	English	t	user	2026-02-04 21:30:59.037654
45	Saurabh Tiwari	saurabh.tiwari@email.com	India	$2b$10$hash041	Hindi	f	user	2026-02-04 21:30:59.037654
46	Madison Scott	madison.scott@email.com	USA	$2b$10$hash042	English	f	user	2026-02-04 21:30:59.037654
47	Nishant Choudhary	nishant.choudhary@email.com	India	$2b$10$hash043	Hindi	f	user	2026-02-04 21:30:59.037654
48	Elizabeth Adams	elizabeth.adams@email.com	USA	$2b$10$hash044	English	f	user	2026-02-04 21:30:59.037654
49	Aman Verma	aman.verma@email.com	India	$2b$10$hash045	Hindi	f	user	2026-02-04 21:30:59.037654
50	Victoria Baker	victoria.baker@email.com	UK	$2b$10$hash046	English	f	user	2026-02-04 21:30:59.037654
51	Kunal Singh	kunal.singh@email.com	India	$2b$10$hash047	Hindi	f	user	2026-02-04 21:30:59.037654
53	Shubham Jain	shubham.jain@email.com	India	$2b$10$hash049	Hindi	f	user	2026-02-04 21:30:59.037654
54	Chloe Carter	chloe.carter@email.com	USA	$2b$10$hash050	English	t	user	2026-02-04 21:30:59.037654
55	Mayank Gupta	mayank.gupta@email.com	India	$2b$10$hash051	Hindi	f	user	2026-02-04 21:30:59.037654
56	Lily Mitchell	lily.mitchell@email.com	Canada	$2b$10$hash052	English	f	user	2026-02-04 21:30:59.037654
57	Rajat Khanna	rajat.khanna@email.com	India	$2b$10$hash053	Punjabi	f	user	2026-02-04 21:30:59.037654
58	Zoe Perez	zoe.perez@email.com	USA	$2b$10$hash054	English	f	user	2026-02-04 21:30:59.037654
59	Sahil Malhotra	sahil.malhotra@email.com	India	$2b$10$hash055	Hindi	f	user	2026-02-04 21:30:59.037654
60	Natalie Roberts	natalie.roberts@email.com	UK	$2b$10$hash056	English	f	user	2026-02-04 21:30:59.037654
61	Yash Agrawal	yash.agrawal@email.com	India	$2b$10$hash057	Hindi	f	user	2026-02-04 21:30:59.037654
62	Hannah Turner	hannah.turner@email.com	USA	$2b$10$hash058	English	f	user	2026-02-04 21:30:59.037654
63	Dhruv Kapoor	dhruv.kapoor@email.com	India	$2b$10$hash059	Hindi	f	user	2026-02-04 21:30:59.037654
64	Samantha Phillips	samantha.phillips@email.com	Australia	$2b$10$hash060	English	f	user	2026-02-04 21:30:59.037654
65	Chirag Shah	chirag.shah@email.com	India	$2b$10$hash061	Gujarati	f	user	2026-02-04 21:30:59.037654
66	Aria Campbell	aria.campbell@email.com	Canada	$2b$10$hash062	English	t	user	2026-02-04 21:30:59.037654
67	Manish Kumar	manish.kumar@email.com	India	$2b$10$hash063	Hindi	f	user	2026-02-04 21:30:59.037654
68	Layla Parker	layla.parker@email.com	USA	$2b$10$hash064	English	f	user	2026-02-04 21:30:59.037654
69	Ravi Yadav	ravi.yadav@email.com	India	$2b$10$hash065	Hindi	f	user	2026-02-04 21:30:59.037654
70	Stella Evans	stella.evans@email.com	UK	$2b$10$hash066	English	f	user	2026-02-04 21:30:59.037654
71	Ashish Mishra	ashish.mishra@email.com	India	$2b$10$hash067	Hindi	f	user	2026-02-04 21:30:59.037654
72	Lucy Edwards	lucy.edwards@email.com	USA	$2b$10$hash068	English	f	user	2026-02-04 21:30:59.037654
73	Vivek Pandey	vivek.pandey@email.com	India	$2b$10$hash069	Hindi	f	user	2026-02-04 21:30:59.037654
74	Nora Collins	nora.collins@email.com	Canada	$2b$10$hash070	English	f	user	2026-02-04 21:30:59.037654
75	Tarun Bhardwaj	tarun.bhardwaj@email.com	India	$2b$10$hash071	Hindi	f	user	2026-02-04 21:30:59.037654
76	Scarlett Stewart	scarlett.stewart@email.com	USA	$2b$10$hash072	English	f	user	2026-02-04 21:30:59.037654
77	Ankit Singhal	ankit.singhal@email.com	India	$2b$10$hash073	Hindi	f	user	2026-02-04 21:30:59.037654
79	Sumit Garg	sumit.garg@email.com	India	$2b$10$hash075	Hindi	f	user	2026-02-04 21:30:59.037654
80	Riley Morris	riley.morris@email.com	Australia	$2b$10$hash076	English	f	user	2026-02-04 21:30:59.037654
81	Sandeep Reddy	sandeep.reddy@email.com	India	$2b$10$hash077	Telugu	f	user	2026-02-04 21:30:59.037654
82	Zoey Rogers	zoey.rogers@email.com	UK	$2b$10$hash078	English	f	user	2026-02-04 21:30:59.037654
83	Himanshu Jain	himanshu.jain@email.com	India	$2b$10$hash079	Hindi	f	user	2026-02-04 21:30:59.037654
84	Claire Reed	claire.reed@email.com	USA	$2b$10$hash080	English	f	user	2026-02-04 21:30:59.037654
85	Rohit Sinha	rohit.sinha@email.com	India	$2b$10$hash081	Hindi	f	user	2026-02-04 21:30:59.037654
86	Bella Cook	bella.cook@email.com	Canada	$2b$10$hash082	English	f	user	2026-02-04 21:30:59.037654
87	Pankaj Dubey	pankaj.dubey@email.com	India	$2b$10$hash083	Hindi	f	user	2026-02-04 21:30:59.037654
88	Aurora Morgan	aurora.morgan@email.com	USA	$2b$10$hash084	English	f	user	2026-02-04 21:30:59.037654
89	Deepak Goyal	deepak.goyal@email.com	India	$2b$10$hash085	Hindi	f	user	2026-02-04 21:30:59.037654
90	Nova Bell	nova.bell@email.com	UK	$2b$10$hash086	English	f	user	2026-02-04 21:30:59.037654
91	Naveen Kumar	naveen.kumar@email.com	India	$2b$10$hash087	Tamil	f	user	2026-02-04 21:30:59.037654
92	Skylar Murphy	skylar.murphy@email.com	Australia	$2b$10$hash088	English	f	user	2026-02-04 21:30:59.037654
93	Lokesh Sharma	lokesh.sharma@email.com	India	$2b$10$hash089	Hindi	f	user	2026-02-04 21:30:59.037654
94	Ellie Bailey	ellie.bailey@email.com	USA	$2b$10$hash090	English	t	user	2026-02-04 21:30:59.037654
95	Vishal Chopra	vishal.chopra@email.com	India	$2b$10$hash091	Hindi	f	user	2026-02-04 21:30:59.037654
96	Maya Rivera	maya.rivera@email.com	USA	$2b$10$hash092	English	f	user	2026-02-04 21:30:59.037654
97	Sachin Kaul	sachin.kaul@email.com	India	$2b$10$hash093	Hindi	f	user	2026-02-04 21:30:59.037654
98	Naomi Cooper	naomi.cooper@email.com	UK	$2b$10$hash094	English	f	user	2026-02-04 21:30:59.037654
99	Manoj Tiwari	manoj.tiwari@email.com	India	$2b$10$hash095	Hindi	f	user	2026-02-04 21:30:59.037654
100	Elena Richardson	elena.richardson@email.com	Canada	$2b$10$hash096	English	f	user	2026-02-04 21:30:59.037654
101	Ajay Bisht	ajay.bisht@email.com	India	$2b$10$hash097	Hindi	f	user	2026-02-04 21:30:59.037654
102	Savannah Cox	savannah.cox@email.com	USA	$2b$10$hash098	English	f	user	2026-02-04 21:30:59.037654
103	Suresh Babu	suresh.babu@email.com	India	$2b$10$hash099	Telugu	f	user	2026-02-04 21:30:59.037654
104	Brooklyn Howard	brooklyn.howard@email.com	USA	$2b$10$hash100	English	f	user	2026-02-04 21:30:59.037654
205	Mukesh Ambani	mukesh@gmail.com	IN	pbkdf2_sha256$1200000$ehRMOv3hBv979JpepMyZXq$uyZLe5EjNonta62J1DxUR1A4jlMOxnUWiZfxiAo9uUQ=	\N	f	user	2026-04-06 18:04:45.595276
\.


--
-- Data for Name: watch_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.watch_history (user_id, media_id, episode_id, watched_at) FROM stdin;
2	1	\N	2023-05-14 20:30:00
2	2	\N	2023-04-11 19:00:00
2	3	\N	2023-03-14 21:00:00
3	1	\N	2023-06-19 20:00:00
3	3	\N	2023-04-19 19:30:00
4	1	\N	2023-07-09 20:30:00
4	2	\N	2023-04-30 19:00:00
4	3	\N	2023-05-04 21:00:00
2	6	19	2023-08-05 22:00:00
2	6	20	2023-08-06 22:00:00
2	6	21	2023-08-07 22:00:00
3	7	26	2023-07-10 21:00:00
3	7	27	2023-07-11 21:00:00
3	7	28	2023-07-12 21:00:00
4	8	34	2023-06-20 22:00:00
4	8	35	2023-06-21 22:00:00
\.


--
-- Data for Name: watchlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.watchlist (watchlist_id, user_id, name, visibility, created_at) FROM stdin;
1	2	My Public Watchlist	public	2026-02-04 20:05:20.245876
2	2	My Private Watchlist	private	2026-02-04 20:05:20.245876
3	3	Want to Watch	public	2026-02-04 20:05:20.25347
4	3	Secret Favorites	private	2026-02-04 20:05:20.25347
5	4	Plan to Watch	public	2026-02-04 20:05:21.713106
6	4	Personal List	private	2026-02-04 20:05:21.713106
7	205	Mukesh Ambani's Private Watchlist	private	2026-04-06 18:38:39.876013
8	205	Mukesh Ambani's Public Watchlist	public	2026-04-06 18:38:39.88401
\.


--
-- Data for Name: watchlist_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.watchlist_item (watchlist_id, media_id, added_at) FROM stdin;
1	5	2023-09-10 00:00:00
1	9	2023-09-15 00:00:00
1	10	2023-09-20 00:00:00
2	4	2023-08-05 00:00:00
2	11	2023-08-10 00:00:00
3	8	2023-07-01 00:00:00
3	11	2023-07-15 00:00:00
3	4	2023-08-01 00:00:00
4	2	2023-06-20 00:00:00
4	5	2023-07-10 00:00:00
5	9	2023-08-15 00:00:00
5	10	2023-08-20 00:00:00
5	12	2023-09-01 00:00:00
6	5	2023-07-25 00:00:00
6	13	2023-08-30 00:00:00
2	5	2026-02-18 21:50:05.379982
\.


--
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 112, true);


--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_groups_id_seq', 1, false);


--
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_id_seq', 1, false);


--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_user_permissions_id_seq', 1, false);


--
-- Name: booking_booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_booking_id_seq', 20, true);


--
-- Name: cinema_cinema_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cinema_cinema_id_seq', 6, true);


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 1, false);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 28, true);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 20, true);


--
-- Name: episode_episode_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.episode_episode_id_seq', 36, true);


--
-- Name: genre_genre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.genre_genre_id_seq', 12, true);


--
-- Name: media_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_media_id_seq', 149, true);


--
-- Name: person_person_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.person_person_id_seq', 311, true);


--
-- Name: platform_platform_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.platform_platform_id_seq', 9, true);


--
-- Name: review_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_review_id_seq', 68, true);


--
-- Name: screen_screen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.screen_screen_id_seq', 16, true);


--
-- Name: season_season_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.season_season_id_seq', 24, true);


--
-- Name: showing_showing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.showing_showing_id_seq', 32, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 205, true);


--
-- Name: watchlist_watchlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.watchlist_watchlist_id_seq', 8, true);


--
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- Name: auth_user_groups auth_user_groups_user_id_group_id_94350c0c_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id);


--
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_permission_id_14a6b632_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id);


--
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- Name: booking booking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_pkey PRIMARY KEY (booking_id);


--
-- Name: cast_crew cast_crew_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cast_crew
    ADD CONSTRAINT cast_crew_pkey PRIMARY KEY (media_id, person_id, role);


--
-- Name: cinema cinema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cinema
    ADD CONSTRAINT cinema_pkey PRIMARY KEY (cinema_id);


--
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- Name: episode episode_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.episode
    ADD CONSTRAINT episode_pkey PRIMARY KEY (episode_id);


--
-- Name: genre genre_genre_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genre
    ADD CONSTRAINT genre_genre_name_key UNIQUE (genre_name);


--
-- Name: genre genre_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genre
    ADD CONSTRAINT genre_pkey PRIMARY KEY (genre_id);


--
-- Name: media_genre media_genre_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_genre
    ADD CONSTRAINT media_genre_pkey PRIMARY KEY (media_id, genre_id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (media_id);


--
-- Name: media_platform media_platform_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_platform
    ADD CONSTRAINT media_platform_pkey PRIMARY KEY (media_id, platform_id, region);


--
-- Name: media_similarity media_similarity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_similarity
    ADD CONSTRAINT media_similarity_pkey PRIMARY KEY (media_id_1, media_id_2);


--
-- Name: movie movie_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie
    ADD CONSTRAINT movie_pkey PRIMARY KEY (media_id);


--
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (person_id);


--
-- Name: platform platform_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform
    ADD CONSTRAINT platform_pkey PRIMARY KEY (platform_id);


--
-- Name: platform platform_platform_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform
    ADD CONSTRAINT platform_platform_name_key UNIQUE (platform_name);


--
-- Name: review_like review_like_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_like
    ADD CONSTRAINT review_like_pkey PRIMARY KEY (review_id, user_id);


--
-- Name: review review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_pkey PRIMARY KEY (review_id);


--
-- Name: screen screen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.screen
    ADD CONSTRAINT screen_pkey PRIMARY KEY (screen_id);


--
-- Name: season season_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.season
    ADD CONSTRAINT season_pkey PRIMARY KEY (season_id);


--
-- Name: showing showing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.showing
    ADD CONSTRAINT showing_pkey PRIMARY KEY (showing_id);


--
-- Name: tv_show tv_show_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tv_show
    ADD CONSTRAINT tv_show_pkey PRIMARY KEY (media_id);


--
-- Name: screen unique_cinema_screen; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.screen
    ADD CONSTRAINT unique_cinema_screen UNIQUE (cinema_id, screen_name);


--
-- Name: episode unique_episode_per_season; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.episode
    ADD CONSTRAINT unique_episode_per_season UNIQUE (season_id, episode_number);


--
-- Name: showing unique_screen_datetime; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.showing
    ADD CONSTRAINT unique_screen_datetime UNIQUE (screen_id, show_date, show_time);


--
-- Name: season unique_season_per_show; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.season
    ADD CONSTRAINT unique_season_per_show UNIQUE (media_id, season_number);


--
-- Name: review unique_user_media_review; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT unique_user_media_review UNIQUE (user_id, media_id);


--
-- Name: watchlist unique_user_visibility; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT unique_user_visibility UNIQUE (user_id, visibility);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: watch_history watch_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watch_history
    ADD CONSTRAINT watch_history_pkey PRIMARY KEY (user_id, media_id, watched_at);


--
-- Name: watchlist_item watchlist_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist_item
    ADD CONSTRAINT watchlist_item_pkey PRIMARY KEY (watchlist_id, media_id);


--
-- Name: watchlist watchlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_pkey PRIMARY KEY (watchlist_id);


--
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- Name: auth_user_groups_group_id_97559544; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_group_id_97559544 ON public.auth_user_groups USING btree (group_id);


--
-- Name: auth_user_groups_user_id_6a12ed8b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_user_id_6a12ed8b ON public.auth_user_groups USING btree (user_id);


--
-- Name: auth_user_user_permissions_permission_id_1fbb5f2c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON public.auth_user_user_permissions USING btree (permission_id);


--
-- Name: auth_user_user_permissions_user_id_a95ead1b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON public.auth_user_user_permissions USING btree (user_id);


--
-- Name: auth_user_username_6821ab7c_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_username_6821ab7c_like ON public.auth_user USING btree (username varchar_pattern_ops);


--
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- Name: indx_booking_showing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_booking_showing ON public.booking USING btree (showing_id);


--
-- Name: indx_booking_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_booking_status ON public.booking USING btree (booking_status);


--
-- Name: indx_booking_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_booking_time ON public.booking USING btree (booking_time);


--
-- Name: indx_booking_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_booking_user ON public.booking USING btree (user_id);


--
-- Name: indx_castcrew_media; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_castcrew_media ON public.cast_crew USING btree (media_id);


--
-- Name: indx_castcrew_person; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_castcrew_person ON public.cast_crew USING btree (person_id);


--
-- Name: indx_castcrew_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_castcrew_role ON public.cast_crew USING btree (media_id, role);


--
-- Name: indx_cinema_city; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_cinema_city ON public.cinema USING btree (city);


--
-- Name: indx_cinema_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_cinema_location ON public.cinema USING btree (location);


--
-- Name: indx_cinema_region; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_cinema_region ON public.cinema USING btree (region);


--
-- Name: indx_episode_episode_id_seq; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_episode_episode_id_seq ON public.episode USING btree (episode_id);


--
-- Name: indx_episode_media; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_episode_media ON public.episode USING btree (media_id);


--
-- Name: indx_episode_release; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_episode_release ON public.episode USING btree (release_date);


--
-- Name: indx_episode_season; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_episode_season ON public.episode USING btree (season_id);


--
-- Name: indx_genre_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_genre_name ON public.genre USING btree (genre_name);


--
-- Name: indx_media_language; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_media_language ON public.media USING btree (language);


--
-- Name: indx_media_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_media_rating ON public.media USING btree (aggregate_rating);


--
-- Name: indx_media_release_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_media_release_date ON public.media USING btree (release_date);


--
-- Name: indx_media_title; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_media_title ON public.media USING btree (title);


--
-- Name: indx_media_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_media_type ON public.media USING btree (media_type);


--
-- Name: indx_mediaplatform_media; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_mediaplatform_media ON public.media_platform USING btree (media_id);


--
-- Name: indx_mediaplatform_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_mediaplatform_platform ON public.media_platform USING btree (platform_id, region);


--
-- Name: indx_mediaplatform_region; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_mediaplatform_region ON public.media_platform USING btree (region);


--
-- Name: indx_person_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_person_name ON public.person USING btree (name);


--
-- Name: indx_review_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_review_date ON public.review USING btree (review_date);


--
-- Name: indx_review_media; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_review_media ON public.review USING btree (media_id);


--
-- Name: indx_review_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_review_rating ON public.review USING btree (rating);


--
-- Name: indx_review_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_review_user ON public.review USING btree (user_id);


--
-- Name: indx_reviewlike_review; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_reviewlike_review ON public.review_like USING btree (review_id);


--
-- Name: indx_reviewlike_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_reviewlike_user ON public.review_like USING btree (user_id);


--
-- Name: indx_screen_cinema; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_screen_cinema ON public.screen USING btree (cinema_id);


--
-- Name: indx_season_media; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_season_media ON public.season USING btree (media_id);


--
-- Name: indx_season_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_season_number ON public.season USING btree (media_id, season_number);


--
-- Name: indx_showing_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_showing_date ON public.showing USING btree (show_date, show_time);


--
-- Name: indx_showing_media; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_showing_media ON public.showing USING btree (media_id, show_date);


--
-- Name: indx_showing_screen; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_showing_screen ON public.showing USING btree (screen_id, show_date);


--
-- Name: indx_similarity_media1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_similarity_media1 ON public.media_similarity USING btree (media_id_1, similarity_score DESC);


--
-- Name: indx_similarity_media2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_similarity_media2 ON public.media_similarity USING btree (media_id_2, similarity_score DESC);


--
-- Name: indx_similarity_score; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_similarity_score ON public.media_similarity USING btree (similarity_score DESC);


--
-- Name: indx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_users_email ON public.users USING btree (email);


--
-- Name: indx_users_region; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_users_region ON public.users USING btree (region);


--
-- Name: indx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_users_role ON public.users USING btree (role);


--
-- Name: indx_watchhistory_episode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_watchhistory_episode ON public.watch_history USING btree (episode_id);


--
-- Name: indx_watchhistory_media; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_watchhistory_media ON public.watch_history USING btree (media_id);


--
-- Name: indx_watchhistory_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_watchhistory_user ON public.watch_history USING btree (user_id, watched_at);


--
-- Name: indx_watchlist_availability; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_watchlist_availability ON public.watchlist USING btree (user_id, visibility);


--
-- Name: indx_watchlist_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_watchlist_user ON public.watchlist USING btree (user_id);


--
-- Name: indx_watchlistitem_added; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_watchlistitem_added ON public.watchlist_item USING btree (added_at);


--
-- Name: indx_watchlistitem_media; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_watchlistitem_media ON public.watchlist_item USING btree (media_id);


--
-- Name: indx_watchlistitem_watchlist; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX indx_watchlistitem_watchlist ON public.watchlist_item USING btree (watchlist_id);


--
-- Name: booking trg_decrement_seats; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_decrement_seats AFTER INSERT ON public.booking FOR EACH ROW WHEN (((new.booking_status)::text = 'confirmed'::text)) EXECUTE FUNCTION public.fn_decrement_seats();


--
-- Name: booking trg_restore_seats; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_restore_seats AFTER UPDATE OF booking_status ON public.booking FOR EACH ROW EXECUTE FUNCTION public.fn_restore_seats();


--
-- Name: episode trg_sync_episodes_on_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sync_episodes_on_delete AFTER DELETE ON public.episode FOR EACH ROW EXECUTE FUNCTION public.fn_sync_total_episodes();


--
-- Name: episode trg_sync_episodes_on_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sync_episodes_on_insert AFTER INSERT ON public.episode FOR EACH ROW EXECUTE FUNCTION public.fn_sync_total_episodes();


--
-- Name: season trg_sync_seasons_on_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sync_seasons_on_delete AFTER DELETE ON public.season FOR EACH ROW EXECUTE FUNCTION public.fn_sync_total_seasons();


--
-- Name: season trg_sync_seasons_on_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sync_seasons_on_insert AFTER INSERT ON public.season FOR EACH ROW EXECUTE FUNCTION public.fn_sync_total_seasons();


--
-- Name: review trg_update_rating_on_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_rating_on_delete AFTER DELETE ON public.review FOR EACH ROW EXECUTE FUNCTION public.fn_decrement_review_count();


--
-- Name: review trg_update_rating_on_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_rating_on_insert AFTER INSERT ON public.review FOR EACH ROW EXECUTE FUNCTION public.fn_update_aggregate_rating();


--
-- Name: review trg_update_rating_on_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_rating_on_update AFTER UPDATE OF rating ON public.review FOR EACH ROW EXECUTE FUNCTION public.fn_update_aggregate_rating_on_update();


--
-- Name: booking trg_validate_booking_price; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_validate_booking_price BEFORE INSERT ON public.booking FOR EACH ROW EXECUTE FUNCTION public.fn_validate_booking_price();


--
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_groups auth_user_groups_group_id_97559544_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_97559544_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_groups auth_user_groups_user_id_6a12ed8b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_6a12ed8b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_user_permissions auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: booking fk_booking_showing; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT fk_booking_showing FOREIGN KEY (showing_id) REFERENCES public.showing(showing_id) ON DELETE RESTRICT;


--
-- Name: booking fk_booking_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: cast_crew fk_castcrew_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cast_crew
    ADD CONSTRAINT fk_castcrew_media FOREIGN KEY (media_id) REFERENCES public.media(media_id) ON DELETE CASCADE;


--
-- Name: cast_crew fk_castcrew_person; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cast_crew
    ADD CONSTRAINT fk_castcrew_person FOREIGN KEY (person_id) REFERENCES public.person(person_id) ON DELETE CASCADE;


--
-- Name: episode fk_episode_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.episode
    ADD CONSTRAINT fk_episode_media FOREIGN KEY (media_id) REFERENCES public.media(media_id) ON DELETE CASCADE;


--
-- Name: episode fk_episode_season; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.episode
    ADD CONSTRAINT fk_episode_season FOREIGN KEY (season_id) REFERENCES public.season(season_id) ON DELETE CASCADE;


--
-- Name: media_genre fk_mediagenre_genre; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_genre
    ADD CONSTRAINT fk_mediagenre_genre FOREIGN KEY (genre_id) REFERENCES public.genre(genre_id) ON DELETE CASCADE;


--
-- Name: media_genre fk_mediagenre_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_genre
    ADD CONSTRAINT fk_mediagenre_media FOREIGN KEY (media_id) REFERENCES public.media(media_id) ON DELETE CASCADE;


--
-- Name: media_platform fk_mediaplatform_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_platform
    ADD CONSTRAINT fk_mediaplatform_media FOREIGN KEY (media_id) REFERENCES public.media(media_id) ON DELETE CASCADE;


--
-- Name: media_platform fk_mediaplatform_platform; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_platform
    ADD CONSTRAINT fk_mediaplatform_platform FOREIGN KEY (platform_id) REFERENCES public.platform(platform_id) ON DELETE CASCADE;


--
-- Name: movie fk_movie_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movie
    ADD CONSTRAINT fk_movie_media FOREIGN KEY (media_id) REFERENCES public.media(media_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: review fk_review_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT fk_review_media FOREIGN KEY (media_id) REFERENCES public.media(media_id) ON DELETE CASCADE;


--
-- Name: review fk_review_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: review_like fk_reviewlike_review; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_like
    ADD CONSTRAINT fk_reviewlike_review FOREIGN KEY (review_id) REFERENCES public.review(review_id) ON DELETE CASCADE;


--
-- Name: review_like fk_reviewlike_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_like
    ADD CONSTRAINT fk_reviewlike_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: screen fk_screen_cinema; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.screen
    ADD CONSTRAINT fk_screen_cinema FOREIGN KEY (cinema_id) REFERENCES public.cinema(cinema_id) ON DELETE CASCADE;


--
-- Name: season fk_season_tvshow; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.season
    ADD CONSTRAINT fk_season_tvshow FOREIGN KEY (media_id) REFERENCES public.tv_show(media_id) ON DELETE CASCADE;


--
-- Name: showing fk_showing_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.showing
    ADD CONSTRAINT fk_showing_media FOREIGN KEY (media_id) REFERENCES public.movie(media_id) ON DELETE CASCADE;


--
-- Name: showing fk_showing_screen; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.showing
    ADD CONSTRAINT fk_showing_screen FOREIGN KEY (screen_id) REFERENCES public.screen(screen_id) ON DELETE CASCADE;


--
-- Name: media_similarity fk_similarity_media1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_similarity
    ADD CONSTRAINT fk_similarity_media1 FOREIGN KEY (media_id_1) REFERENCES public.media(media_id) ON DELETE CASCADE;


--
-- Name: media_similarity fk_similarity_media2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_similarity
    ADD CONSTRAINT fk_similarity_media2 FOREIGN KEY (media_id_2) REFERENCES public.media(media_id) ON DELETE CASCADE;


--
-- Name: tv_show fk_tvshow_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tv_show
    ADD CONSTRAINT fk_tvshow_media FOREIGN KEY (media_id) REFERENCES public.media(media_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: watch_history fk_watchhistory_episode; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watch_history
    ADD CONSTRAINT fk_watchhistory_episode FOREIGN KEY (episode_id) REFERENCES public.episode(episode_id) ON DELETE CASCADE;


--
-- Name: watch_history fk_watchhistory_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watch_history
    ADD CONSTRAINT fk_watchhistory_media FOREIGN KEY (media_id) REFERENCES public.media(media_id) ON DELETE CASCADE;


--
-- Name: watch_history fk_watchhistory_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watch_history
    ADD CONSTRAINT fk_watchhistory_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: watchlist fk_watchlist_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: watchlist_item fk_watchlistitem_media; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist_item
    ADD CONSTRAINT fk_watchlistitem_media FOREIGN KEY (media_id) REFERENCES public.media(media_id) ON DELETE CASCADE;


--
-- Name: watchlist_item fk_watchlistitem_watchlist; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist_item
    ADD CONSTRAINT fk_watchlistitem_watchlist FOREIGN KEY (watchlist_id) REFERENCES public.watchlist(watchlist_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict FFLxwyglxSkxXqWXzyad9B1EC567aS8d7YduZgXS08MOoIbhomkPNjoshWCjzJ5

