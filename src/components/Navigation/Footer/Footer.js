import React from 'react';

import { Link } from 'react-router-dom';

import styles from './Footer.module.css';

const footer = (props) => {
    return (
        <footer className={styles.Footer}>
            <div className={styles.Links}>
                <span>
                <a href="http://www.cclusa.org" target="_blank" rel="noopener noreferrer">Home</a> | <Link to="/signup">Sign Up</Link>
                </span>
            </div>
            <div className={styles.ShoutOutCCL}>
                <span>
                    A project of <a href="http://www.cclusa.org" target="_blank" rel="noopener noreferrer">Citizens' Climate Lobby</a> volunteers.
                </span>
            </div>
            <div>
                <span>Questions or feedback? <a href="https://forms.gle/yq6vXYnaf3EbKKZS6" target="_blank" rel="noopener noreferrer">Contact Us</a></span>
            </div>
        </footer>
    );
};

export default footer;
