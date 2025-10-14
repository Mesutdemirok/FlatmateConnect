--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: favorites; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.favorites (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    listing_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.favorites OWNER TO neondb_owner;

--
-- Name: listing_images; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.listing_images (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    listing_id character varying NOT NULL,
    image_path character varying NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.listing_images OWNER TO neondb_owner;

--
-- Name: listings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.listings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    title character varying NOT NULL,
    address text NOT NULL,
    rent_amount numeric(8,2) NOT NULL,
    property_type character varying,
    bills_included boolean DEFAULT false,
    internet_included boolean DEFAULT false,
    status character varying DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    total_rooms integer,
    bathroom_type character varying,
    furnishing_status character varying,
    amenities text[],
    total_occupants integer,
    roommate_preference character varying,
    smoking_policy character varying,
    excluded_bills text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.listings OWNER TO neondb_owner;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    sender_id character varying NOT NULL,
    receiver_id character varying NOT NULL,
    listing_id character varying,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: seeker_photos; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.seeker_photos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    seeker_id character varying NOT NULL,
    image_path character varying NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.seeker_photos OWNER TO neondb_owner;

--
-- Name: seeker_profiles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.seeker_profiles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    age integer,
    gender character varying,
    about text,
    occupation character varying,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    profile_photo_url character varying,
    full_name character varying,
    budget_monthly character varying,
    preferred_location text,
    smoking_preference character varying,
    pet_preference character varying,
    cleanliness_level character varying,
    social_level character varying,
    work_schedule character varying,
    age_preference_min integer,
    age_preference_max integer,
    gender_preference character varying
);


ALTER TABLE public.seeker_profiles OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: user_preferences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_preferences (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    smoking_preference character varying,
    pet_preference character varying,
    cleanliness_level character varying,
    social_level character varying,
    work_schedule character varying,
    age_preference_min integer,
    age_preference_max integer,
    gender_preference character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_preferences OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    password character varying,
    password_reset_token character varying,
    password_reset_expires timestamp without time zone,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    phone character varying,
    date_of_birth date,
    gender character varying,
    occupation character varying,
    bio text,
    verification_status character varying DEFAULT 'unverified'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.favorites (id, user_id, listing_id, created_at) FROM stdin;
841682a2-e9b0-45fc-9a44-2f9905600e09	9cfea22c-39ef-47e1-b4a9-9e852ff222a9	8ee2031d-4113-41d0-954a-cc28019462e0	2025-10-11 10:46:44.536745
35a1bb6d-55d8-4ce5-9181-18bd0f0ec8a6	0d319498-4ffa-40ea-8705-9b748adb7a31	8ae7f815-209b-4762-9e34-169e0489ffa1	2025-10-11 17:12:19.695109
\.


--
-- Data for Name: listing_images; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.listing_images (id, listing_id, image_path, is_primary, created_at) FROM stdin;
bd97fbe2-f98d-4118-abee-f980ebf39b12	96ed77a6-693e-465a-a696-da0e3f3a58f9	/uploads/listings/images-1760179202801-63911936.png	t	2025-10-11 10:40:27.74319
173c71e7-0588-46da-b9f3-f628b397f686	96ed77a6-693e-465a-a696-da0e3f3a58f9	/uploads/listings/images-1760179202802-154753110.jpeg	f	2025-10-11 10:40:27.794882
c7af693c-f4cf-4d3b-891f-18e4d2901c76	6e675ef0-d652-4a8f-bf79-4c62736a394a	/uploads/listings/images-1760190365609-585117291.jpg	t	2025-10-11 13:46:06.125611
345e1237-107c-4438-af68-40b44f1c0a43	6e675ef0-d652-4a8f-bf79-4c62736a394a	/uploads/listings/images-1760190365800-151896415.jpg	f	2025-10-11 13:46:06.178524
55d79097-e77d-4925-9667-4c62c65583c5	6e675ef0-d652-4a8f-bf79-4c62736a394a	/uploads/listings/images-1760190365825-421453577.jpeg	f	2025-10-11 13:46:06.230925
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.listings (id, user_id, title, address, rent_amount, property_type, bills_included, internet_included, status, created_at, updated_at, total_rooms, bathroom_type, furnishing_status, amenities, total_occupants, roommate_preference, smoking_policy, excluded_bills) FROM stdin;
27c1303f-ee50-4dad-abc4-8eb2fc13f2dd	94f45062-5d75-4a4d-b18d-138ed40413c3	Beşiktaş'ta Deniz Manzaralı Geniş Oda	Beşiktaş Mahallesi, Çırağan Caddesi No: 15	8500.00	apartment	t	t	active	2025-10-10 18:45:33.470089	2025-10-10 18:45:33.470089	\N	\N	\N	\N	\N	\N	\N	{}
17151881-b469-47d4-b953-042b2c25713d	8d52eb98-679b-4a87-a4c8-5581ae558b3e	Kadıköy'de Öğrenci Dostu Oda	Moda Mahallesi, Bahariye Caddesi No: 45	6000.00	apartment	f	t	active	2025-10-10 18:45:33.569889	2025-10-10 18:45:33.569889	\N	\N	\N	\N	\N	\N	\N	{}
3cb00f81-95d1-4261-9704-e7426468e5e5	bc4520ef-3afb-4a39-988c-7022872153ab	Çankaya'da Lüks Daire	Çankaya Mahallesi, Atatürk Bulvarı No: 120	7500.00	apartment	t	t	active	2025-10-10 18:45:33.665277	2025-10-10 18:45:33.665277	\N	\N	\N	\N	\N	\N	\N	{}
aedd86bd-0f31-4e4f-9d1f-5164fea71be3	94f45062-5d75-4a4d-b18d-138ed40413c3	Alsancak'ta Denize Yakın Oda	Alsancak Mahallesi, Kıbrıs Şehitleri Caddesi No: 78	5500.00	house	f	t	active	2025-10-10 18:45:33.759833	2025-10-10 18:45:33.759833	\N	\N	\N	\N	\N	\N	\N	{}
8ae7f815-209b-4762-9e34-169e0489ffa1	8d52eb98-679b-4a87-a4c8-5581ae558b3e	Bostanlı'da Müstakil Ev	Bostanlı Mahallesi, Atatürk Caddesi No: 234	6500.00	house	t	t	active	2025-10-10 18:45:33.854724	2025-10-10 18:45:33.854724	\N	\N	\N	\N	\N	\N	\N	{}
8ee2031d-4113-41d0-954a-cc28019462e0	6e60bdd1-956f-4645-afe3-8573e5089e8a	Kadıköy Moda da ferah ve aydınlık oda	Kadıköy, İstanbul - Caferağa Mahallesi, Moda Caddesi No:15	5000.00	Apartman	t	t	active	2025-10-11 10:35:58.135621	2025-10-11 10:35:58.135621	3	Ortak	Eşyalı	{Yatak,Dolap,Masa,Sandalye}	2	Farketmez	İçilemez	{}
96ed77a6-693e-465a-a696-da0e3f3a58f9	9cfea22c-39ef-47e1-b4a9-9e852ff222a9	KALABADA ODA	13/4 SELCUKLU KONYA 	4000.00	apartman	t	t	active	2025-10-11 10:40:00.890724	2025-10-11 10:40:00.890724	2	ozel	esyali	{dolap,sandalye,masa}	2	erkek	icilemez	{}
6e675ef0-d652-4a8f-bf79-4c62736a394a	0d319498-4ffa-40ea-8705-9b748adb7a31	Maltepe Ritim İstanbul’da Metroya Yakın Eşyalı Oda	Ritim İstanbul Sitesi, Zümrütevler Mahallesi, Maltepe / İstanbul	18000.00	rezidans	f	t	active	2025-10-11 13:46:05.109301	2025-10-11 13:46:05.109301	2	ozel	kismen	{yatak,masa,klima,dolap}	3	farketmez	icilemez	{Elektrik,Telefon,Doğalgaz}
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, sender_id, receiver_id, listing_id, message, is_read, created_at) FROM stdin;
42f33ddd-2e41-4a80-8980-adcf0318f5c0	0d319498-4ffa-40ea-8705-9b748adb7a31	9cfea22c-39ef-47e1-b4a9-9e852ff222a9	96ed77a6-693e-465a-a696-da0e3f3a58f9	Merhaba boş mu	f	2025-10-11 10:50:53.442363
a45dbeba-dbae-4177-86e5-e37651bdead8	9cfea22c-39ef-47e1-b4a9-9e852ff222a9	0d319498-4ffa-40ea-8705-9b748adb7a31	\N	evet bos	f	2025-10-11 10:52:07.521477
\.


--
-- Data for Name: seeker_photos; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.seeker_photos (id, seeker_id, image_path, sort_order, created_at) FROM stdin;
c23b6b50-9c01-4119-addb-67b740a7ecfe	c0fc32e8-8448-4cec-8b9e-d41b27f0e370	seeker-1760204966625-119235147.jpeg	0	2025-10-11 17:49:29.577444
43cb39e7-3982-43c4-bdc7-673605a0d165	755aea23-da3a-43da-a847-cb74674d8b6b	seeker-1760209874139-503456571.jpeg	0	2025-10-11 19:11:14.895085
0ef9c41f-20b3-4738-8c1f-9c281fde5648	3b8e681c-32bd-4c40-a13f-62163f9e53ab	seeker-1760267616602-225740572.webp	0	2025-10-12 11:13:36.939467
\.


--
-- Data for Name: seeker_profiles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.seeker_profiles (id, user_id, age, gender, about, occupation, is_active, is_featured, created_at, updated_at, profile_photo_url, full_name, budget_monthly, preferred_location, smoking_preference, pet_preference, cleanliness_level, social_level, work_schedule, age_preference_min, age_preference_max, gender_preference) FROM stdin;
30a30062-22d6-4eba-8742-632fcbff8398	6e60bdd1-956f-4645-afe3-8573e5089e8a	25	Erkek	Temiz ve düzenli bir kişiyim. Sakin bir ortam arıyorum.	Çalışan	t	f	2025-10-11 10:36:06.935198	2025-10-11 10:36:06.935198	\N	Test User	6000.00	Kadıköy, İstanbul	\N	\N	\N	\N	\N	\N	\N	\N
8a84c49f-dc6a-40c3-9bbd-756dee7a5d68	9cfea22c-39ef-47e1-b4a9-9e852ff222a9	60	erkek	bu bir test	calisan	t	f	2025-10-11 10:43:03.924794	2025-10-11 10:43:03.924794	\N	yeter demir	5998.00	sisli	\N	\N	\N	\N	\N	\N	\N	\N
c0fc32e8-8448-4cec-8b9e-d41b27f0e370	0d319498-4ffa-40ea-8705-9b748adb7a31	44	erkek	bu bir test	serbest	t	f	2025-10-11 17:49:26.111477	2025-10-11 19:39:14.212	/uploads/seekers/seeker-1760204966625-119235147.jpeg	MESUT mestok	12000	sisli Beyoğlu	smoker	all-pets	clean	social	work-from-home	2	4	female
755aea23-da3a-43da-a847-cb74674d8b6b	0d319498-4ffa-40ea-8705-9b748adb7a31	40	erkek	Ben bir testim 	calisan	t	f	2025-10-11 19:11:13.74684	2025-10-11 19:39:38.296	/uploads/seekers/seeker-1760209874139-503456571.jpeg	Mahmut tuncer	10000	Kadikkoy	non-smoker	dog-friendly	very-clean	balanced	work-from-home	3	3	female
c7d4cef0-7598-4897-9477-55555a4dad66	94f45062-5d75-4a4d-b18d-138ed40413c3	24	female	Üniversite öğrencisiyim. Temiz ve düzenli bir ev arıyorum. Sigara içmiyorum ve evcil hayvanım yok.	Öğrenci	t	t	2025-10-11 06:15:54.837623	2025-10-11 06:15:54.837623	https://ui-avatars.com/api/?name=Ahmet+Y&background=8b5cf6&color=fff&size=400	Ahmet Y.	8000	Kadıköy, İstanbul	\N	\N	\N	\N	\N	\N	\N	\N
498e068e-239d-4489-9a79-c946a109119f	bc4520ef-3afb-4a39-988c-7022872153ab	26	female	Sosyal bir insanım. Ev arkadaşlarımla vakit geçirmeyi severim. Kedim var, evcil hayvan dostu ev arıyorum.	Grafik Tasarımcı	t	t	2025-10-11 06:15:55.030111	2025-10-11 06:15:55.030111	https://ui-avatars.com/api/?name=Zeynep+K&background=ec4899&color=fff&size=400	Zeynep K.	10000	Beşiktaş, İstanbul	\N	\N	\N	\N	\N	\N	\N	\N
2319a0d2-4628-4967-9d45-88b5ab4438a5	8d52eb98-679b-4a87-a4c8-5581ae558b3e	28	male	Yazılım mühendisiyim. Sakin ve huzurlu bir ortamda çalışabileceğim bir oda arıyorum.	Yazılım Mühendisi	t	t	2025-10-11 06:15:54.937956	2025-10-11 06:15:54.937956	https://ui-avatars.com/api/?name=Mehmet+D&background=3b82f6&color=fff&size=400	Mehmet D.	9000	Şişli, İstanbul	\N	\N	\N	\N	\N	\N	\N	\N
3b8e681c-32bd-4c40-a13f-62163f9e53ab	e2d17a64-f17d-42aa-ab1d-1a6b7b564f53	30	kadin	Düzenli, yaşam tarzı olan, çalışan, profesyonel bir bayanım. \n\nBir seneliğine İstanbul'da oda kiralamak için burada bulunuyorum. 	calisan	t	f	2025-10-11 19:45:50.86112	2025-10-12 11:13:36.976	/uploads/seekers/seeker-1760267616602-225740572.webp	senem	15000	Kadıköy, Ataköy, Üsküdar. 	non-smoker	all-pets	very-clean	social	shift-work	5	5	female
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: user_preferences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_preferences (id, user_id, smoking_preference, pet_preference, cleanliness_level, social_level, work_schedule, age_preference_min, age_preference_max, gender_preference, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, password, password_reset_token, password_reset_expires, first_name, last_name, profile_image_url, phone, date_of_birth, gender, occupation, bio, verification_status, created_at, updated_at) FROM stdin;
94f45062-5d75-4a4d-b18d-138ed40413c3	ahmet@example.com	$2b$10$6NXB61BW5.Oi.fh3RVxWE.f3DyVx8E7u7QhnmsI4CiT3AMfR7aOuO	\N	\N	Ahmet	Yılmaz	\N	+90 555 123 4567	\N	erkek	\N	Yazılım mühendisi, temiz ve düzenli yaşamayı seven biri	verified	2025-10-10 18:45:33.05647	2025-10-10 18:45:33.05647
8d52eb98-679b-4a87-a4c8-5581ae558b3e	ayse@example.com	$2b$10$obpsuxzLdQS3P11Hc05gA.fgLlVQHkgpbSE59/vcE87l3TVz4P1Cq	\N	\N	Ayşe	Demir	\N	+90 555 234 5678	\N	kadın	\N	Öğrenci, sosyal ve arkadaş canlısı	verified	2025-10-10 18:45:33.217037	2025-10-10 18:45:33.217037
bc4520ef-3afb-4a39-988c-7022872153ab	mehmet@example.com	$2b$10$ckmPVDTHBJsRlRE1LCuUwuK6kHWU2s4aHEjdHviDejmRU6QmU/38O	\N	\N	Mehmet	Kaya	\N	+90 555 345 6789	\N	erkek	\N	İş insanı, sakin ortamları tercih ederim	verified	2025-10-10 18:45:33.372026	2025-10-10 18:45:33.372026
9cfea22c-39ef-47e1-b4a9-9e852ff222a9	mesudemirok@hotmail.com	$2b$10$rCs4DE6/zQIKtmvzQB.IEeZ.vu6EGv/gLn1xpGbt5tIURn7TlT3jK	\N	\N	Memo	Demo	\N	\N	\N	\N	\N	\N	unverified	2025-10-11 06:48:50.432129	2025-10-11 06:48:50.432129
6e60bdd1-956f-4645-afe3-8573e5089e8a	test@test.com	$2b$10$.NtEYlZVRrGGgvvPBSa.C.jAPRNNC5ZwgLftIyAqdpYKIfQm./.ym	\N	\N	Test	User	\N	\N	\N	\N	\N	\N	unverified	2025-10-11 10:35:35.494412	2025-10-11 10:35:35.494412
0d319498-4ffa-40ea-8705-9b748adb7a31	admin@odanet.com.tr	$2b$10$1b/J/GmTUWsXcosjj3xvCOImAD9W10hkxL8NpsT0sME4X5OGwA8Ry	\N	\N	Mahmut 	Tuncer	\N	\N	\N	\N	\N	\N	unverified	2025-10-11 10:50:14.836358	2025-10-11 10:50:14.836358
e2d17a64-f17d-42aa-ab1d-1a6b7b564f53	senemuncu@gmail.com	$2b$10$iYoa78haS.fq6W/AQZPa0.xthUZOkX4Uha78TgrIsDkVrrV0dKnvS	\N	\N	senem	uncu	\N	\N	\N	\N	\N	\N	unverified	2025-10-11 19:42:39.983129	2025-10-11 19:42:39.983129
\.


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: listing_images listing_images_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.listing_images
    ADD CONSTRAINT listing_images_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: seeker_photos seeker_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.seeker_photos
    ADD CONSTRAINT seeker_photos_pkey PRIMARY KEY (id);


--
-- Name: seeker_profiles seeker_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.seeker_profiles
    ADD CONSTRAINT seeker_profiles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: user_preferences user_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: favorites favorites_listing_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_listing_id_listings_id_fk FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: listing_images listing_images_listing_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.listing_images
    ADD CONSTRAINT listing_images_listing_id_listings_id_fk FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: listings listings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_listing_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_listing_id_listings_id_fk FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;


--
-- Name: messages messages_receiver_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_users_id_fk FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: seeker_photos seeker_photos_seeker_id_seeker_profiles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.seeker_photos
    ADD CONSTRAINT seeker_photos_seeker_id_seeker_profiles_id_fk FOREIGN KEY (seeker_id) REFERENCES public.seeker_profiles(id) ON DELETE CASCADE;


--
-- Name: seeker_profiles seeker_profiles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.seeker_profiles
    ADD CONSTRAINT seeker_profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_preferences user_preferences_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_preferences
    ADD CONSTRAINT user_preferences_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

