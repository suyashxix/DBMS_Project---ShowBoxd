--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

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
    CONSTRAINT booking_booking_status_check CHECK (((booking_status)::text = ANY ((ARRAY['confirmed'::character varying, 'cancelled'::character varying])::text[]))),
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
    CONSTRAINT cast_crew_role_check CHECK (((role)::text = ANY ((ARRAY['actor'::character varying, 'director'::character varying, 'producer'::character varying, 'writer'::character varying, 'cinematographer'::character varying, 'composer'::character varying])::text[])))
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
    CONSTRAINT media_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['movie'::character varying, 'tv_show'::character varying])::text[]))),
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
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
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
    CONSTRAINT platform_platform_type_check CHECK (((platform_type)::text = ANY ((ARRAY['OTT'::character varying, 'Theatrical'::character varying])::text[])))
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
    CONSTRAINT tv_show_status_check CHECK (((status)::text = ANY ((ARRAY['upcoming'::character varying, 'ongoing'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))),
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
    CONSTRAINT watchlist_visibility_check CHECK (((visibility)::text = ANY ((ARRAY['public'::character varying, 'private'::character varying])::text[])))
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

