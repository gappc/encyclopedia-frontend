import Link from 'next/link';

const Footer = ({ contextualClass }) => {
    return (
        <footer
            className={`home-footer${
                contextualClass ? ` ${contextualClass}` : ''
            }`}
        >
            <div className="internal-space">
                <ul>
                    <li>
                        <Link href="/animeshon/[page]" as="/animeshon/about">
                            <a>About</a>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/animeshon/[page]"
                            as="/animeshon/privacy-policy"
                        >
                            <a>Privacy</a>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/animeshon/[page]"
                            as="/animeshon/terms-and-conditions"
                        >
                            <a>Terms</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/animeshon/[page]" as="/animeshon/contacts">
                            <a>Contacts</a>
                        </Link>
                    </li>
                </ul>
                <p>&copy; Copyright 2020 Animeshon.com - All Rights Reserved</p>
            </div>
        </footer>
    );
};

export default Footer;
