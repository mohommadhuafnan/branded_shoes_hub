import { useEffect, useState } from 'react';
import about1 from './assets/about1.png';
import about2 from './assets/about2.png';
import about3 from './assets/about3.png';
import about4 from './assets/about4.png';

function About() {
    const images = [about1, about2, about3, about4];
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % images.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="about" id="about">
            <div className="aboutusText">
                <h2>About Shoes Hub</h2>
                <p className="aboutIntro">
                    Welcome to <span>Shoes Hub</span>, your trusted place for stylish,
                    comfortable, and modern footwear.
                </p>

                <p>
                    We offer quality shoes for men, women, and kids with the latest
                    designs, affordable prices, and different sizes to match every style. <br /> <br />

                    Whether you are looking for everyday wear, special occasion shoes, or the newest trends, Shoes Hub is your trusted destination for the best footwear.
                </p>

                <div className="aboutFeatures">
                    <div className="featureCard">Modern Designs</div>
                    <div className="featureCard">Comfort & Quality</div>
                    <div className="featureCard">Affordable Prices</div>
                    <div className="featureCard">All Sizes Available</div>
                </div>

                <h3>Shoes Hub – Step into Style and Comfort</h3>
            </div>

            <div className="aboutimage">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`aboutimg1 ${activeIndex === index ? 'active' : ''}`}
                    >
                        <img src={img} alt={`Shoes Hub ${index + 1}`} />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default About;