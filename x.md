Search
Search all Posts

$
View Pricing

Retrieves Posts from the full archive matching a search query.

GET
/
2
/
tweets
/
search
/
all

Try it
Authorizations
​
Authorization
stringheaderrequired
Bearer authentication header of the form Bearer <token>, where <token> is your auth token.

Query Parameters
​
query
stringrequired
One query/rule/filter for matching Posts. Refer to https://t.co/rulelength to identify the max query length.

Required string length: 1 - 4096
Example:
"(from:TwitterDev OR from:TwitterAPI) has:media -is:retweet"

​
start_time
string<date-time>
YYYY-MM-DDTHH:mm:ssZ. The oldest UTC timestamp from which the Posts will be provided. Timestamp is in second granularity and is inclusive (i.e. 12:00:01 includes the first second of the minute).

​
end_time
string<date-time>
YYYY-MM-DDTHH:mm:ssZ. The newest, most recent UTC timestamp to which the Posts will be provided. Timestamp is in second granularity and is exclusive (i.e. 12:00:01 excludes the first second of the minute).

​
since_id
string
Returns results with a Post ID greater than (that is, more recent than) the specified ID.
Unique identifier of this Tweet. This is returned as a string in order to avoid complications with languages and tools that cannot handle large integers.

Example:
"1346889436626259968"

​
until_id
string
Returns results with a Post ID less than (that is, older than) the specified ID.
Unique identifier of this Tweet. This is returned as a string in order to avoid complications with languages and tools that cannot handle large integers.

Example:
"1346889436626259968"

​
max_results
integer<int32>default:10
The maximum number of search results to be returned by a request.

Required range: 10 <= x <= 500
​
next_token
string
This parameter is used to get the next 'page' of results. The value used with the parameter is pulled directly from the response provided by the API, and should not be modified.
A base36 pagination token.

Minimum string length: 1
​
pagination_token
string
This parameter is used to get the next 'page' of results. The value used with the parameter is pulled directly from the response provided by the API, and should not be modified.
A base36 pagination token.

Minimum string length: 1
​
sort_order
enum<string>
This order in which to return results.

Available options: recency, relevancy
​
tweet.fields
enum<string>[]
A comma separated list of Tweet fields to display.
The fields available for a Tweet object.

Minimum array length: 1
Available options: article, attachments, author_id, card_uri, community_id, context_annotations, conversation_id, created_at, display_text_range, edit_controls, edit_history_tweet_ids, entities, geo, id, in_reply_to_user_id, lang, media_metadata, non_public_metrics, note_tweet, organic_metrics, possibly_sensitive, promoted_metrics, public_metrics, referenced_tweets, reply_settings, scopes, source, suggested_source_links, suggested_source_links_with_counts, text, withheld
Example:
[
"article",
"attachments",
"author_id",
"card_uri",
"community_id",
"context_annotations",
"conversation_id",
"created_at",
"display_text_range",
"edit_controls",
"edit_history_tweet_ids",
"entities",
"geo",
"id",
"in_reply_to_user_id",
"lang",
"media_metadata",
"non_public_metrics",
"note_tweet",
"organic_metrics",
"possibly_sensitive",
"promoted_metrics",
"public_metrics",
"referenced_tweets",
"reply_settings",
"scopes",
"source",
"suggested_source_links",
"suggested_source_links_with_counts",
"text",
"withheld"
]
​
expansions
enum<string>[]
A comma separated list of fields to expand.
The list of fields you can expand for a Tweet object. If the field has an ID, it can be expanded into a full object.

Minimum array length: 1
Available options: article.cover_media, article.media_entities, attachments.media_keys, attachments.media_source_tweet, attachments.poll_ids, author_id, edit_history_tweet_ids, entities.mentions.username, geo.place_id, in_reply_to_user_id, entities.note.mentions.username, referenced_tweets.id, referenced_tweets.id.attachments.media_keys, referenced_tweets.id.author_id
Example:
[
"article.cover_media",
"article.media_entities",
"attachments.media_keys",
"attachments.media_source_tweet",
"attachments.poll_ids",
"author_id",
"edit_history_tweet_ids",
"entities.mentions.username",
"geo.place_id",
"in_reply_to_user_id",
"entities.note.mentions.username",
"referenced_tweets.id",
"referenced_tweets.id.attachments.media_keys",
"referenced_tweets.id.author_id"
]
​
media.fields
enum<string>[]
A comma separated list of Media fields to display.
The fields available for a Media object.

Minimum array length: 1
Available options: alt_text, duration_ms, height, media_key, non_public_metrics, organic_metrics, preview_image_url, promoted_metrics, public_metrics, type, url, variants, width
Example:
[
"alt_text",
"duration_ms",
"height",
"media_key",
"non_public_metrics",
"organic_metrics",
"preview_image_url",
"promoted_metrics",
"public_metrics",
"type",
"url",
"variants",
"width"
]
​
poll.fields
enum<string>[]
A comma separated list of Poll fields to display.
The fields available for a Poll object.

Minimum array length: 1
Available options: duration_minutes, end_datetime, id, options, voting_status
Example:
[
"duration_minutes",
"end_datetime",
"id",
"options",
"voting_status"
]
​
user.fields
enum<string>[]
A comma separated list of User fields to display.
The fields available for a User object.

Minimum array length: 1
Available options: affiliation, confirmed_email, connection_status, created_at, description, entities, id, is_identity_verified, location, most_recent_tweet_id, name, parody, pinned_tweet_id, profile_banner_url, profile_image_url, protected, public_metrics, receives_your_dm, subscription, subscription_type, url, username, verified, verified_followers_count, verified_type, withheld
Example:
[
"affiliation",
"confirmed_email",
"connection_status",
"created_at",
"description",
"entities",
"id",
"is_identity_verified",
"location",
"most_recent_tweet_id",
"name",
"parody",
"pinned_tweet_id",
"profile_banner_url",
"profile_image_url",
"protected",
"public_metrics",
"receives_your_dm",
"subscription",
"subscription_type",
"url",
"username",
"verified",
"verified_followers_count",
"verified_type",
"withheld"
]
​
place.fields
enum<string>[]
A comma separated list of Place fields to display.
The fields available for a Place object.

Minimum array length: 1
Available options: contained_within, country, country_code, full_name, geo, id, name, place_type
Example:
[
"contained_within",
"country",
"country_code",
"full_name",
"geo",
"id",
"name",
"place_type"
]

Search
Search recent Posts

$
View Pricing

Retrieves Posts from the last 7 days matching a search query.

GET
/
2
/
tweets
/
search
/
recent

Try it
Authorizations

BearerToken
BearerToken
​
Authorization
stringheaderrequired
Bearer authentication header of the form Bearer <token>, where <token> is your auth token.

Query Parameters
​
query
stringrequired
One query/rule/filter for matching Posts. Refer to https://t.co/rulelength to identify the max query length.

Required string length: 1 - 4096
Example:
"(from:TwitterDev OR from:TwitterAPI) has:media -is:retweet"

​
start_time
string<date-time>
YYYY-MM-DDTHH:mm:ssZ. The oldest UTC timestamp from which the Posts will be provided. Timestamp is in second granularity and is inclusive (i.e. 12:00:01 includes the first second of the minute).

​
end_time
string<date-time>
YYYY-MM-DDTHH:mm:ssZ. The newest, most recent UTC timestamp to which the Posts will be provided. Timestamp is in second granularity and is exclusive (i.e. 12:00:01 excludes the first second of the minute).

​
since_id
string
Returns results with a Post ID greater than (that is, more recent than) the specified ID.
Unique identifier of this Tweet. This is returned as a string in order to avoid complications with languages and tools that cannot handle large integers.

Example:
"1346889436626259968"

​
until_id
string
Returns results with a Post ID less than (that is, older than) the specified ID.
Unique identifier of this Tweet. This is returned as a string in order to avoid complications with languages and tools that cannot handle large integers.

Example:
"1346889436626259968"

​
max_results
integer<int32>default:10
The maximum number of search results to be returned by a request.

Required range: 10 <= x <= 100
​
next_token
string
This parameter is used to get the next 'page' of results. The value used with the parameter is pulled directly from the response provided by the API, and should not be modified.
A base36 pagination token.

Minimum string length: 1
​
pagination_token
string
This parameter is used to get the next 'page' of results. The value used with the parameter is pulled directly from the response provided by the API, and should not be modified.
A base36 pagination token.

Minimum string length: 1
​
sort_order
enum<string>
This order in which to return results.

Available options: recency, relevancy
​
tweet.fields
enum<string>[]
A comma separated list of Tweet fields to display.
The fields available for a Tweet object.

Minimum array length: 1
Available options: article, attachments, author_id, card_uri, community_id, context_annotations, conversation_id, created_at, display_text_range, edit_controls, edit_history_tweet_ids, entities, geo, id, in_reply_to_user_id, lang, media_metadata, non_public_metrics, note_tweet, organic_metrics, possibly_sensitive, promoted_metrics, public_metrics, referenced_tweets, reply_settings, scopes, source, suggested_source_links, suggested_source_links_with_counts, text, withheld
Example:
[
"article",
"attachments",
"author_id",
"card_uri",
"community_id",
"context_annotations",
"conversation_id",
"created_at",
"display_text_range",
"edit_controls",
"edit_history_tweet_ids",
"entities",
"geo",
"id",
"in_reply_to_user_id",
"lang",
"media_metadata",
"non_public_metrics",
"note_tweet",
"organic_metrics",
"possibly_sensitive",
"promoted_metrics",
"public_metrics",
"referenced_tweets",
"reply_settings",
"scopes",
"source",
"suggested_source_links",
"suggested_source_links_with_counts",
"text",
"withheld"
]
​
expansions
enum<string>[]
A comma separated list of fields to expand.
The list of fields you can expand for a Tweet object. If the field has an ID, it can be expanded into a full object.

Minimum array length: 1
Available options: article.cover_media, article.media_entities, attachments.media_keys, attachments.media_source_tweet, attachments.poll_ids, author_id, edit_history_tweet_ids, entities.mentions.username, geo.place_id, in_reply_to_user_id, entities.note.mentions.username, referenced_tweets.id, referenced_tweets.id.attachments.media_keys, referenced_tweets.id.author_id
Example:
[
"article.cover_media",
"article.media_entities",
"attachments.media_keys",
"attachments.media_source_tweet",
"attachments.poll_ids",
"author_id",
"edit_history_tweet_ids",
"entities.mentions.username",
"geo.place_id",
"in_reply_to_user_id",
"entities.note.mentions.username",
"referenced_tweets.id",
"referenced_tweets.id.attachments.media_keys",
"referenced_tweets.id.author_id"
]
​
media.fields
enum<string>[]
A comma separated list of Media fields to display.
The fields available for a Media object.

Minimum array length: 1
Available options: alt_text, duration_ms, height, media_key, non_public_metrics, organic_metrics, preview_image_url, promoted_metrics, public_metrics, type, url, variants, width
Example:
[
"alt_text",
"duration_ms",
"height",
"media_key",
"non_public_metrics",
"organic_metrics",
"preview_image_url",
"promoted_metrics",
"public_metrics",
"type",
"url",
"variants",
"width"
]
​
poll.fields
enum<string>[]
A comma separated list of Poll fields to display.
The fields available for a Poll object.

Minimum array length: 1
Available options: duration_minutes, end_datetime, id, options, voting_status
Example:
[
"duration_minutes",
"end_datetime",
"id",
"options",
"voting_status"
]
​
user.fields
enum<string>[]
A comma separated list of User fields to display.
The fields available for a User object.

Minimum array length: 1
Available options: affiliation, confirmed_email, connection_status, created_at, description, entities, id, is_identity_verified, location, most_recent_tweet_id, name, parody, pinned_tweet_id, profile_banner_url, profile_image_url, protected, public_metrics, receives_your_dm, subscription, subscription_type, url, username, verified, verified_followers_count, verified_type, withheld
Example:
[
"affiliation",
"confirmed_email",
"connection_status",
"created_at",
"description",
"entities",
"id",
"is_identity_verified",
"location",
"most_recent_tweet_id",
"name",
"parody",
"pinned_tweet_id",
"profile_banner_url",
"profile_image_url",
"protected",
"public_metrics",
"receives_your_dm",
"subscription",
"subscription_type",
"url",
"username",
"verified",
"verified_followers_count",
"verified_type",
"withheld"
]
​
place.fields
enum<string>[]
A comma separated list of Place fields to display.
The fields available for a Place object.

Minimum array length: 1
Available options: contained_within, country, country_code, full_name, geo, id, name, place_type
Example:
[
"contained_within",
"country",
"country_code",
"full_name",
"geo",
"id",
"name",
"place_type"
]
Response

200

application/json
The request has succeeded.

​
data
object[]
Minimum array length: 1
Show child attributes

​
errors
object[]
Minimum array length: 1
An HTTP Problem Details object, as defined in IETF RFC 7807 (https://tools.ietf.org/html/rfc7807).

Option 1
Option 2
Option 3
Option 4
Option 5
Option 6
Option 7
Option 8
Option 9
Option 10
Option 11
Option 12
Option 13
Option 14
Option 15
Option 16
Option 17
Option 18
Show child attributes

​
includes
object
Show child attributes

​
meta
object
Show child attributes
