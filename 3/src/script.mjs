import config from "./config.json" with {type: "json"};
(function () {
    let block;
    let [count, delay, limit, timer] = [0, 0, 0, 0];
    let input;
    let lang;
    let speakStm;
    let stimuli;
    let tsk = "char";
    let wakeReq;
    const audio = new AudioContext();
    const auto = {
        down: 0,
        range: config.autoUp + 1,
        up: 0
    };
    const [board, head] = [document.body, document.head];
    const tasks = ["char", "color"];
    const speech = window.speechSynthesis;
    const wake = async function () {
        wakeReq = await navigator.wakeLock.request("screen");
    };
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
    function error(txt) {
        const el = create("div", board);
        el.className = "error";
        el.textContent = `[${txt}]`;
    }
    function loadLang() {
        const path = `./lang/${config.lang}.json`;
        async function getJSON(file) {
            const res = await fetch(file);
            if (!res.ok) {
                error("No language file");
                throw new Error();
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
    function speak(stm, vol = 1) {
        if (!speech) {
            return;
        }
        const req = new SpeechSynthesisUtterance(stm);
        req.lang = navigator.language;
        req.rate = 1.1;
        req.volume = vol;
        speech.speak(req);
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
    function dflt(x = config.limitMin) {
        [limit, auto.up, auto.down] = [x, 0, 0];
    }
    function init() {
        board.style.setProperty("--time", `${config.timeStimulus / 1000}s`);
        dflt();
        main();
        if (!speech) {
            error("No speech API");
        }
    }
    function prep() {
        [...board.childNodes].forEach((el) => el.remove());
    }
    function main() {
        const clone = $("#tmpl-1", head).content.cloneNode(true);
        prep();
        function clean() {
            dflt();
            $(".result")?.remove();
        }
        function setX(prssd) {
            if (prssd) {
                if (config.autoUp >= auto.range) {
                    config.autoUp = 1;
                } else {
                    config.autoUp += 1;
                }
                clean();
            }
            return (
                auto.up > 0
                ? `${auto.up} / ${config.autoUp}`
                : `${lang.ctrl[0]} ${config.autoUp}`
            );
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
                clean();
                $(".x").textContent = setX();
            }
            return (
                tsk === "color"
                ? lang.ctrl[1]
                : config.alphanumeric
                ? "A-9"
                : "0-9"
            );
        }
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
        function fscreen() {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                board.parentNode.requestFullscreen();
            }
        }
        ctrl(
            $(".x", clone),
            function (el) {
                el.textContent = setX(true);
            },
            setX()
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
        ctrl(
            $(".help", clone),
            help,
            "?"
        );
        ctrl(
            $(".circle", clone),
            task
        );
        ctrl(
            $(".screen", clone),
            fscreen
        );
        if (!document.fullscreenEnabled) {
            $(".screen", clone).className = "none";
        }
        [input, limit, result.true] = [[], (
            limit > 99
            ? config.limitMin
            : limit
        ), false];
        board.append(clone);
    }
    function build() {
        let stm = "";
        const [s, stim, qty] = [[], [], config.qty[tsk]];
        const random = (a) => a.splice(
            Math.floor(Math.random() * a.length),
            1
        )[0];
        const alt = {
            char() {
                const a = [...new Array(10).keys()].map((inc) => 48 + inc);
                if (config.alphanumeric) {
                    a.push(...[...new Array(26).keys()].map((inc) => 65 + inc));
                    while (a.length > qty) {
                        random(a);
                    }
                } else {
                    a.push(a.shift());
                }
                stimuli = a.map((cp) => JSON.stringify(
                    String.fromCodePoint(cp)
                ));
                speakStm = true;
            },
            color() {
                stimuli = [
                    "#157717", "#d82727", "#3131d3", "#d6c918",
                    "#8a008a", "#d56e2a", "#7d6040", "#56a",
                    "#63cfc4", "#42be42", "#fff", "#bb63ad"
                ];
                speakStm = false;
            }
        };
        alt[tsk]();
        if (qty < stimuli.length) {
            stimuli.length = qty;
        }
        stim.push(...stimuli);
        stm = random(stim);
        function ptrn(a, b) {
            const [cp1, cp2] = [a.codePointAt(1), b.codePointAt(1)];
            return cp1 + 1 === cp2 || cp1 - 1 === cp2;
        }
        while (s.push(stm) < limit) {
            while (
                stm === s.at(-1) ||
                (tsk === "char" && ptrn(stm, s.at(-1)))
            ) {
                stm = random(stim);
                if (!stim.length) {
                    stim.push(...stimuli);
                }
            }
        }
        return s;
    }
    function panel() {
        let [i, b] = [0, 0];
        let li;
        const pnl = $(".panel");
        const [stim, btns] = [[...block.reverse()], [...stimuli]];
        const setBtn = (
            tsk === "color"
            ? () => btns.splice(Math.floor(Math.random() * btns.length), 1)[0]
            : () => btns.shift()
        );
        const blank = config.qty[tsk] % config.columns;
        const size = (
            blank
            ? config.qty[tsk] + config.columns - blank
            : config.qty[tsk]
        );
        function btn(el) {
            if (result.true) {
                return;
            }
            const stm = el.style.getPropertyValue("--stm");
            const wrong = stm !== stim.shift();
            if (input.push(stm) === limit || wrong) {
                result(wrong);
            }
        }
        pnl.style.setProperty("--clms", config.columns);
        while (i < size) {
            li = create("li", pnl);
            if (
                b < stimuli.length &&
                !(blank && config.columns === 3 && i === size - 3)
            ) {
                li.style.setProperty("--stm", setBtn());
                li.className = tsk;
                ctrl(
                    li,
                    btn
                );
                b += 1;
            }
            i += 1;
        }
    }
    function clear() {
        clearTimeout(delay);
        clearInterval(timer);
        speech?.cancel();
        wakeReq?.release();
    }
    function run(sq) {
        function state() {
            if (count === limit) {
                clear();
                sq.remove();
                panel();
                return;
            }
            const stm = block[count];
            count += 1;
            if (document.hidden) {
                return;
            }
            requestAnimationFrame(function () {
                sq.classList.add(tsk);
                sq.style.setProperty("--stm", stm);
                if (config.sound && speakStm) {
                    speak(stm.replace(/"/g, ""));
                } else {
                    speak(" ", 0); //iOS
                }
            });
            sq.addEventListener("animationend", function () {
                sq.classList.remove(tsk);
            }, {once: true});
        }
        delay = setTimeout(function () {
            state();
            timer = setInterval(state, config.timeRate);
        }, 1500);
    }
    function task() {
        const clone = $("#tmpl-2", head).content.cloneNode(true);
        const sq = $(".sq", clone);
        prep();
        count = 0;
        ctrl(
            $(".esc", clone),
            function () {
                clear();
                dflt();
                main();
            }
        );
        board.append(clone);
        if (config.qty[tsk] < 6) {
            error("Unsound value");
            return;
        }
        block = build();
        speak(" ", 0);
        wake();
        run(sq);
    }
    function result(wrong) {
        const clone = $("#tmpl-3", head).content.cloneNode(true);
        const ul = [...$(".result", clone).children];
        const [b, i] = [block.length, input.length];
        function trimEnd(t) {
            block.length = t;
            block.push(JSON.stringify("..."));
        }
        function trimStart(t) {
            [block, input].forEach(function (a) {
                a.splice(0, t);
                a.unshift(JSON.stringify("..."));
            });
        }
        result.true = true;
        setTimeout(function () {
            if (wrong) {
                auto.down += 1;
                if (block.length > 10) {
                    if (i < 7) {
                        trimEnd(10);
                    } else if (i < b - 5) {
                        trimEnd(i + 4);
                        trimStart(i - 6);
                    } else {
                        trimStart(b - 10);
                    }
                }
                ul[0].textContent = `- ${lang.res[0]} -`;
                ul[1].classList.add("match");
                ul[1].style.setProperty("--match", block.length);
                [...block, ...input].forEach(function (stm) {
                    const el = create("span", ul[1]);
                    el.style.setProperty("--stm", stm);
                    el.className = (
                        stm.includes(".")
                        ? "char"
                        : tsk
                    );
                });
                ul[2].className = "none";
                if (
                    auto.down === config.autoDown &&
                    limit !== config.limitMin
                ) {
                    limit -= 1;
                    dflt(limit);
                }
                playBuzzer();
                auto.up = 0;
            } else {
                auto.up += 1;
                [
                    `- ${lang.res[1]} -`,
                    `${lang.res[2]}: ${limit}`,
                    `${lang.res[3]}: ${
                        limit < 5
                        ? lang.res[4]
                        : limit < 8
                        ? lang.res[5]
                        : lang.res[6]
                    }`
                ].forEach(function (txt, i) {
                    ul[i].textContent = txt;
                });
                if (auto.up === config.autoUp) {
                    ul[1].className = "complete";
                    limit += 1;
                    dflt(limit);
                }
                playAlert();
                auto.down = 0;
            }
            main();
            board.append(clone);
        }, 150);
    }
    document.addEventListener("touchstart", function (e) {
        e.preventDefault();
    }, {passive: false});
    loadLang().then(() => init());
}());

