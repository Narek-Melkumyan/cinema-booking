
function Hero() {
    return (
        <section className="hero">
            <div className="container">
                <div className="hero-box">
                    <div className="hero-content">
                        <div className="eyebrow">Այս շաբաթվա ընտրանին</div>
                        <h1>Քո հաջորդ ֆիլմը սկսվում է այստեղ</h1>
                        <p>Ընտրիր ֆիլմը, սեանսը և նստատեղը՝ մի քանի քայլով։ Ժամանակակից և պարզ cinema booking փորձ։</p>
                        <div className="hero-actions">
                            <a href="#movies" className="btn btn-primary">Ընտրել ֆիլմ</a>
                            <a href="#booking" className="btn btn-dark">Դիտել ամրագրումը</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    );
}

export default Hero;