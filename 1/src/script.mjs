import config from "./config.json" with {type: "json"};
(function () {
    let block;
    let [count, limit, score, time1, time2] = [0, 0, 0, 0, 0];
    let idx;
    let lang;
    let mode;
    let prevMode;
    let prevTsk;
    let tsk = "char";
    const audio = new AudioContext();
    const [board, head] = [document.body, document.head];
    const tasks = ["arrow", "char"];
    const [xyMax, xyMin] = [8, 5];
    function $(sel, el = board) {
        return el.querySelector(sel);
    }
    function create(tag, parent) {
        const el = document.createElement(tag);
        if (parent) {
            parent.append(el);
        }
        return el;
    }
    function error(txt, terminate = true) {
        const el = create("div", board);
        el.className = "error";
        el.textContent = `[${txt}]`;
        if (terminate) {
            throw new Error(txt);
        }
    }
    function loadLang() {
        const path = `./lang/${config.lang}.json`;
        async function getJSON(file) {
            const res = await fetch(file);
            if (!res.ok) {
                error("No language file");
            }
            lang = await res.json();
        }
        return getJSON(path);
    }
    function ocillate(props) {
        if (!config.sound) {
            return;
        }
        const p = Object.assign({
            gain: 0.2,
            ramp: true,
            start: 0,
            wave: "sine"
        }, props);
        const o = new OscillatorNode(audio, {
            frequency: p.freq,
            type: p.wave
        });
        const g = new GainNode(audio, {
            gain: p.gain
        });
        g.gain.setValueAtTime(p.gain, audio.currentTime + p.start + 0.01);
        if (p.ramp) {
            g.gain.exponentialRampToValueAtTime(
                0.0001,
                audio.currentTime + p.stop
            );
        }
        o.connect(g).connect(audio.destination);
        o.start(audio.currentTime + p.start);
        o.stop(audio.currentTime + p.stop);
    }
    function playPress() {
        ocillate({
            freq: 540,
            stop: 0.1
        });
    }
    function playAlert() {
        let [a, b] = [0, 13];
        const inc = 9;
        while (b < 68) {
            ocillate({
                freq: 1600,
                start: a / 100,
                stop: b / 100
            });
            a += inc;
            b += inc;
        }
    }
    function playBuzzer() {
        ocillate({
            freq: 140,
            gain: 0.18,
            ramp: false,
            stop: 0.6,
            wave: "sawtooth"
        });
    }
    function ctrl(el, func, txt) {
        let active;
        if (txt) {
            el.textContent = txt;
        }
        el.addEventListener("pointerdown", function () {
            playPress();
            el.classList.add("active");
            active = true;
            document.addEventListener("pointerup", function () {
                el.classList.remove("active");
                active = false;
            }, {once: true});
        });
        el.addEventListener("pointerup", function () {
            if (active) {
                el.classList.remove("active");
                active = false;
                func(el);
            }
        });
    }
    function prep() {
        [...board.childNodes].forEach((el) => el.remove());
    }
    function main() {
        const clone = $("#tmpl-1", head).content.cloneNode(true);
        prep();
        function help(el) {
            if (!el.firstChild.nodeValue) {
                el.textContent = "?";
                return;
            }
            el.firstChild.replaceWith(create("ol"));
            Object.values(lang.ol).forEach(function (txt) {
                create("li", el.firstChild).textContent = txt;
            });
        }
        function speaker(prssd) {
            if (prssd) {
                config.sound = !config.sound;
            }
            return (
                config.sound
                ? "🔊"
                : "🔇"
            );
        }
        function setAlt(prssd) {
            if (prssd) {
                tsk = tasks.find((t) => tsk !== t);
            }
            return (
                tsk === "char"
                ? "!"
                : "!!"
            );
        }
        function menu(el) {
            mode = el.id;
            base();
        }
        function source() {
            open($(".source").dataset.href, "_blank");
        }
        function fscreen() {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                board.parentNode.requestFullscreen();
            }
        }
        ctrl(
            $(".help", clone),
            help,
            "?"
        );
        ctrl(
            $(".speaker", clone),
            function (el) {
                el.textContent = speaker(true);
            },
            speaker()
        );
        ctrl(
            $(".alt", clone),
            function (el) {
                el.textContent = setAlt(true);
            },
            setAlt()
        );
        [...$(".menu", clone).children].forEach(function (li, i) {
            ctrl(
                li,
                menu,
                lang.menu[i]
            );
        });
        ctrl(
            $(".source", clone),
            source
        );
        ctrl(
            $(".screen", clone),
            fscreen
        );
        if (!document.fullscreenEnabled) {
            $(".screen", clone).className = "none";
        }
        [score, count] = [0, 0];
        board.append(clone);
    }
    function base() {
        const clone = $("#tmpl-2", head).content.cloneNode(true);
        const circle = $(".circle", clone);
        prep();
        function setX(prssd) {
            if (prssd) {
                if (limit < config.limitMax) {
                    limit += 1;
                } else {
                    limit = config.limitMin;
                }
                [score, count] = [0, 0];
                $(".result")?.remove();
            } else if (prevMode !== mode || prevTsk !== tsk) {
                [limit, prevMode, prevTsk] = [config.limitMin, mode, tsk];
            }
            return `${lang.ctrl[0]} ${limit}`;
        }
        ctrl(
            $(".x", clone),
            function (el) {
                el.textContent = setX(true);
            },
            setX()
        );
        ctrl(
            $(".esc", clone),
            main,
            lang.ctrl[1]
        );
        ctrl(
            circle,
            task
        );
        if (/^(alt|und)/m.test(config.reverse[tsk])) {
            if (!idx?.length) {
                config.reverse[tsk] = (
                    config.reverse[tsk]
                    ? undefined
                    : "alternate"
                );
            }
            circle.className += ` marker${
                config.reverse[tsk]
                ? " reverse"
                : ""
            }`;
        }
        board.append(clone);
    }
    function build() {
        let [v1, v2] = [1, 0];
        const orient = (
            innerWidth > innerHeight
            ? xyMax
            : xyMin
        );
        const grid = Array.from(
            {length: xyMin * xyMax},
            function () {
                if (v2 === orient) {
                    v1 += 1;
                    v2 = 0;
                }
                v2 += 1;
                return `${v1}/${v2}`;
            }
        );
        const alt = {
            arrow() {
                const sect = Math.round(360 / limit * 100) / 100;
                let deg;
                let [s, i] = [sect, 0];
                if (config.randomize[tsk]) {
                    s -= 4;
                    deg = () => Math.round(s - Math.floor(
                        Math.random() * (sect - 7)
                    ));
                } else {
                    deg = () => Math.round(s - sect / 2);
                }
                while (i < limit) {
                    elem(`${deg()}deg`);
                    s += sect;
                    i += 1;
                }
            },
            char() {
                const [codePoint, qty] = (
                    config.alphanumeric === "alpha"
                    ? [65, 26]
                    : config.limitMax < 10
                    ? [49, 9]
                    : [48, 10]
                );
                const a = [...new Array(
                    config.limitMax < qty
                    ? config.limitMax
                    : qty
                ).keys()].map((inc) => codePoint + inc);
                if (limit > qty) {
                    limit = qty;
                }
                if (config.randomize[tsk]) {
                    while (a.length > limit) {
                        a.splice(Math.floor(Math.random() * a.length), 1);
                    }
                } else {
                    a.length = limit;
                }
                a.forEach((cp) => elem(
                    JSON.stringify(String.fromCodePoint(cp))
                ));
            }
        };
        block = [];
        function elem(stm) {
            const sq = create("div");
            sq.className = tsk;
            sq.style.gridArea = grid.splice(
                Math.floor(Math.random() * grid.length),
                1
            )[0];
            sq.style.setProperty("--stm", stm);
            block.push(sq);
        }
        alt[tsk]();
        if (config.reverse[tsk]) {
            block.reverse();
        }
    }
    function unmask(e, sq = e.target.closest(".mask")) {
        if (!sq) {
            return;
        }
        sq.className = "";
        if (block.indexOf(sq) !== idx.shift() || !idx.length) {
            board.removeEventListener("pointerdown", unmask);
            result(sq);
        } else {
            playPress();
        }
    }
    function run() {
        function mask() {
            block.forEach(function (sq) {
                sq.className = "mask";
            });
            time2 = performance.now();
            board.addEventListener("pointerdown", unmask);
            count += 1;
        }
        function trigger(e) {
            const sq = e.target.closest("div");
            if (!sq) {
                return;
            }
            board.removeEventListener("pointerdown", trigger);
            mask();
            unmask(e, sq);
        }
        board.append(...block);
        time1 = performance.now();
        if (config.time[mode]) {
            setTimeout(mask, config.time[mode]);
        } else {
            board.addEventListener("pointerdown", trigger);
        }
    }
    function task() {
        prep();
        idx = [...new Array(limit).keys()];
        board.className = `task${
            config.altMask[tsk]
            ? " alt-mask"
            : ""
        }`;
        build();
        run();
    }
    function result(sq) {
        const clone = $("#tmpl-3", head).content.cloneNode(true);
        const data = [];
        let delay = 0;
        if (idx.length) {
            delay = 800;
            sq.classList.add("wrong", tsk);
            data.push(`- ${lang.res[0]} -`);
            playBuzzer();
        } else {
            score += 1;
            data.push(`- ${lang.res[1]} -`);
            playAlert();
        }
        data.push(
            `${Math.round((score / count) * 100)}% (${score} / ${count})`,
            `${Math.round((time2 - time1) / 10) / 100}${lang.res[2]}`
        );
        data.forEach(function (txt, i) {
            clone.children[0].children[i].textContent = txt;
        });
        setTimeout(function () {
            board.className = "";
            base();
            board.append(clone);
        }, delay);
    }
    document.addEventListener("touchstart", function (e) {
        e.preventDefault();
    }, {passive: false});
    loadLang().then(() => main());
}());

