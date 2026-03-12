const features = [
    {
        icon: "✍️",
        title: "تصميم باسم الشخص",
        description: "كل هدية بتتصمم خصيصاً بالاسم اللي تختاره، بأسلوب بصري راقي ومميز.",
        color: "hsla(340,82%,62%,0.15)",
        border: "hsla(340,82%,62%,0.2)",
    },
    {
        icon: "🎙️",
        title: "رسالة خاصة بصوتك أو كلماتك",
        description: "سجّل صوتك أو اكتب من قلبك — وإحنا نحوّلها لتجربة ما حدش هيقدر ينساها.",
        color: "hsla(270,60%,55%,0.15)",
        border: "hsla(270,60%,55%,0.2)",
    },
    {
        icon: "🎬",
        title: "صور وفيديوهات وأغاني",
        description: "أضف الصور المفضلة، الأغاني، والفيديوهات اللي بتحكي قصتكم بشكل سينمائي.",
        color: "hsla(350,70%,50%,0.15)",
        border: "hsla(350,70%,50%,0.2)",
    },
];

const WhatWeDoSection = () => (
    <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-tajawal">
                🛠️ بنعمل إيه؟
            </h2>

            <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12 font-cairo text-sm leading-relaxed">
                بنصمم هدايا رقمية شخصية ومميزة لكل المناسبات 🎂🤝🎉💑❤️
                <br />
                تجربة كاملة مش مجرد رسالة.
            </p>

            <div className="grid md:grid-cols-3 gap-5">
                {features.map((f, idx) => (
                    <div
                        key={idx}
                        className="glass-card rounded-2xl p-6 flex flex-col gap-3"
                        style={{
                            background: f.color,
                            border: `1px solid ${f.border}`,
                        }}
                    >
                        <span className="text-4xl drop-shadow-sm">{f.icon}</span>
                        <h3 className="text-lg font-bold font-tajawal mt-2">{f.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed font-cairo">
                            {f.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default WhatWeDoSection;
