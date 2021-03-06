import { useState } from 'react';
import Link from 'next/link';
import uniq from 'lodash/uniq';
import kebabCase from 'lodash/kebabCase';
import capitalize from 'lodash/capitalize';

import { undef } from '@/functions/undef';
import { localizer } from '@/functions/localizer';
import { langPickerSwitcher } from '@/functions/langPickerSwitcher';

import getAnimeCast from '@/queries/anime/Cast';

import AnyWrapper from '@/components/_AnyWrapper';
import Button from '@/components/Button';
import CardImage from '@/components/Card/Image';

import { AnimeNavigation } from '@/resources/navigation/allTabNavigations';

const AnimeCast = ({
    anime_id,
    title,
    cover_image,
    hero_image,
    cast_full_list,
    list_of_flags,
}) => {
    const [productionLang, setProductionLang] = useState('jp');

    const changeProductionLang = e => {
        setProductionLang(e.currentTarget.value);
    };
    const final_list = langPickerSwitcher(
        uniq(list_of_flags.filter(i => i != '')),
    ).sort();

    return (
        <AnyWrapper
            anyId={anime_id}
            anyTitle={title}
            coverImage={cover_image}
            heroImage={hero_image}
            coverImageAltText={`${title} Cover`}
            heroImageAltText={`${title} Hero`}
            anyNav={AnimeNavigation}
            selectedMenu="Cast"
        >
            <main className="anime-cast__description grid">
                <section className="landing-section-box">
                    <header>
                        <h3>Cast</h3>
                        {final_list.length !== 0 && (
                            <select default onChange={changeProductionLang}>
                                {final_list.map(obj => {
                                    const { iso, extended } = obj;
                                    return (
                                        <option
                                            key={iso}
                                            value={iso}
                                            selected={iso == productionLang}
                                        >
                                            {extended}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                    </header>
                    <div className="grid-halves">
                        {renderCast(cast_full_list, productionLang)}
                    </div>
                </section>
            </main>
        </AnyWrapper>
    );
};

const renderCast = (items, filter) => {
    const linkTo = '/people/';
    return items.map(item => {
        const linkProps = {
            href: `${linkTo}[people_id]`,
            as: `${linkTo}${item.id + '_' + kebabCase(item.name)}`,
        };

        if (item.nationality.iso == filter) {
            return (
                <div key={item.id} className="card">
                    <Link {...linkProps}>
                        <a>
                            <CardImage
                                type={item.type}
                                sex={item.sex}
                                picture={item.profile_picture}
                                altText={item.name}
                            />
                        </a>
                    </Link>
                    <div className="card__info">
                        <Link {...linkProps}>
                            <a>
                                <h4>{item.name}</h4>
                            </a>
                        </Link>
                        <p className="card__jap-name">{item.japanese_name}</p>
                        <p className="card__role">
                            <span
                                className={`fp fp-sm custom-fp ${item.nationality.iso}`}
                            />
                            {/* {capitalize(item.sex)} TODO: skipped cause is not consistent */}
                        </p>
                        <Button
                            className="cherry-red medium character-button-ref"
                            type="next-link"
                            href={`/characters/[character_id]`}
                            as={`/characters/${
                                item.character.id +
                                '_' +
                                kebabCase(item.character.name)
                            }`}
                        >
                            <span className="character-image">
                                <img
                                    src={item.character.picture}
                                    alt={item.character.name}
                                />
                            </span>
                            <span className="character-name">
                                {item.character.name}
                            </span>
                        </Button>
                    </div>
                </div>
            );
        }
    });
};

AnimeCast.getInitialProps = async ctx => {
    const { anime_id } = ctx.query;
    const client = ctx.apolloClient;

    const raw_id = anime_id.substring(0, 6);

    const res = await client.query({
        query: getAnimeCast(raw_id),
    });

    const data = res.data.queryAnime[0];

    const titles = data ? data.names : []; // returns an array
    const cast = data ? data.voiceActings : []; // returns an array
    const cover_image = data ? data.images[0].image.file.publicUri : ''; // returns a string

    const hero_image = ''; // TODO: Banner image not present
    const title = undef(localizer(titles, ['en-US'])); // returns a string

    const list_of_flags = [];

    const cast_full_list = cast.map(member => {
        const { actor, character, localization } = member;

        const actor_id = actor.id;
        const actor_name = undef(localizer(actor.names, ['en-US']), '');
        const actor_japanese_name = undef(
            localizer(actor.names, ['ja-JP']),
            '',
        );
        const actor_pic = actor.images[0]
            ? actor.images[0].image.file.publicUri
            : '';

        const character_id = character.id;
        const character_pic = character.images[0]
            ? character.images[0].image.file.publicUri
            : '';
        const character_name = undef(localizer(character.names, ['en-US']), '');

        const production_iso =
            localization.id != 'UNDEFINED'
                ? localization.id.split('-')[1].toLowerCase()
                : '';

        list_of_flags.push(production_iso);

        return {
            name: actor_name,
            japanese_name: actor_japanese_name,
            character: {
                name: character_name,
                picture: character_pic,
                id: character_id,
            },
            // sex: '', TODO: skipped coause is not consistent
            nationality: {
                extended: actor_japanese_name ? 'japan' : '',
                iso: production_iso,
            },
            type: 'people',
            person_profession: 'voice-actor',
            profile_picture: actor_pic,
            id: actor_id,
        };
    });

    // TODO: Voice Actors filters based on nationality is impossible to be integrated cause no nationality filter is present
    // TODO: Voice Actors fallback images based on sex are not settable cause of not consistent gender field

    return {
        anime_id,
        title,
        cover_image,
        hero_image,
        cast_full_list,
        list_of_flags,
    };
};

export default AnimeCast;
