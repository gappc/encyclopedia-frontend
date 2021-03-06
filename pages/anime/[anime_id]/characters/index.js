import Link from 'next/link';
import replace from 'lodash/replace';
import kebabCase from 'lodash/kebabCase';

import { undef } from '@/functions/undef';
import { localizer } from '@/functions/localizer';

import getAnimeCharacters from '@/queries/anime/Characters';

import AnyWrapper from '@/components/_AnyWrapper';
import Button from '@/components/Button';
import CardImage from '@/components/Card/Image';

import { AnimeNavigation } from '@/resources/navigation/allTabNavigations';

const AnimeCharacters = ({
    anime_id,
    title,
    cover_image,
    hero_image,
    characters_list,
}) => {
    return (
        <AnyWrapper
            anyId={anime_id}
            anyTitle={title}
            coverImage={cover_image}
            heroImage={hero_image}
            coverImageAltText={`${title} Cover`}
            heroImageAltText={`${title} Hero`}
            anyNav={AnimeNavigation}
            selectedMenu="Characters"
        >
            <main className="anime-characters__description grid">
                <section className="landing-section-box">
                    <header>
                        <h3>Characters</h3>
                    </header>
                    <div className="grid-halves">
                        {characters_list.length != 0 &&
                            renderCharacters(characters_list)}
                    </div>
                </section>
            </main>
        </AnyWrapper>
    );
};

const renderCharacters = items => {
    const linkTo = '/characters/';
    return items.map(item => {
        const linkProps = {
            href: `${linkTo}[character_id]`,
            as: `/characters/${item.id}_${kebabCase(item.english_name)}`,
        };
        return (
            <div key={item.id} className="card">
                <Link {...linkProps}>
                    <a>
                        <CardImage
                            type={item.type}
                            picture={item.profilePic}
                            altText={item.english_name}
                        />
                    </a>
                </Link>

                <div className="card__info">
                    {item.english_name && (
                        <Link {...linkProps}>
                            <a>
                                <h4>{item.english_name}</h4>
                            </a>
                        </Link>
                    )}
                    {item.japanese_name && (
                        <p className="card__jap-name">{item.japanese_name}</p>
                    )}
                    {item.role && (
                        <p className="card__role">{`${item.role.toLowerCase()} Character`}</p>
                    )}
                    <Button
                        className="cherry-red medium"
                        type="next-link"
                        {...linkProps}
                    >
                        More
                    </Button>
                </div>
            </div>
        );
    });
};

AnimeCharacters.getInitialProps = async ctx => {
    const { anime_id } = ctx.query;
    const raw_id = anime_id.substring(0, 6);
    const client = ctx.apolloClient;

    const res = await client.query({
        query: getAnimeCharacters(raw_id),
    });

    const data = res.data.queryAnime[0];

    const titles = data ? data.names : []; // returns an array
    const characters = data ? data.starring : []; // returns an array

    const title = undef(localizer(titles, ['en-US'])); // returns a string
    const cover_image = data ? data.images[0].image.file.publicUri : '';

    // extract the characters
    const characters_list =
        characters.map(char => {
            const { id, images, names, relation } = char.character;

            const english_name = undef(localizer(names, ['en-US']));
            const japanese_name = undef(localizer(names, ['ja-JP']));

            return {
                type: 'character',
                english_name,
                japanese_name,
                profilePic: images[0] ? images[0].image.file.publicUri : '',
                role: char.relation,
                id,
            };
        }) || []; // returns an array

    const hero_image = ''; // TODO: Banner image not present

    return {
        anime_id,
        title,
        cover_image,
        hero_image,
        characters_list,
    };
};

export default AnimeCharacters;
