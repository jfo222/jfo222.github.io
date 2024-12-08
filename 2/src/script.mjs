import config from "./config.json" with {type: "json"};
(function () {
    let [count, delay, timer] = [0, 0, 0];
    let cursorOff;
    let idx;
    let lang;
    let [N, targets, trials] = [config.limitMin, 0, 0];
    let prevTargets;
    let wakeReq;
    const A = {
        block: [],
        bool: false
    };
    const V = {
        block: [],
        bool: false
    };
    const audio = new AudioContext();
    const auto = {
        circle: false,
        count: 0,
        mode: false,
        sum: 0
    };
    const [board, head] = [document.body, document.head];
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
    function error(id) {
        const el = create("div", board);
        el.className = "error";
        el.textContent = `[${lang.error[id]}]`;
    }
    function loadLang() {
        const tags = ["en", "zh"];
        const path = `./lang/${
            config.lang ||
            tags.find((t) => t === navigator.language.slice(0, 2)) ||
            "en"
        }.json`;
        async function getJSON(file) {
            const res = await fetch(file);
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
    function setTrials() {
        trials = config.base + N;
    }
    function init() {
        const grid = $("#tmpl-0", head).content;
        const keyDwn = {
            KeyA() {
                btn(V.bool, 1);
            },
            KeyB() {
                if (!board.className) {
                    config.buttons = !config.buttons;
                    btns();
                }
            },
            KeyL() {
                if (config.sound) {
                    btn(A.bool, 2);
                }
            },
            Space() {
                if (auto.circle) {
                    task();
                } else {
                    toggle();
                }
            }
        };
        function toggle() {
            if (board.className) {
                clear();
                board.removeEventListener("mousemove", cursor);
                clearTimeout(cursorOff);
                board.className = "";
                main();
            } else {
                task();
            }
        }
        ctrl(
            $(".center", grid),
            toggle
        );
        setTrials();
        board.style.setProperty("--time", `${config.timeStimulus / 1000}s`);
        [auto.mode, auto.count] = [false, 0];
        document.addEventListener("keydown", function (e) {
            if (!e.repeat && Object.hasOwn(keyDwn, e.code)) {
                keyDwn[e.code]();
            }
        });
        board.append(grid);
        main();
        if (!speech) {
            error(1);
        }
    }
    function prep() {
        [...board.childNodes].forEach(function (el) {
            if (el.className !== "grid") {
                el.remove();
            }
        });
    }
    function main() {
        const clone = $("#tmpl-1", head).content.cloneNode(true);
        prep();
        function setN(prssd) {
            if (prssd) {
                if (N >= config.limitMax) {
                    N = config.limitMin;
                } else {
                    N += 1;
                }
                setTrials();
            }
            return `${lang.ctrl[0]} ${N}`;
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
        function setX(prssd) {
            if (prssd) {
                auto.mode = !auto.mode;
            }
            return `${lang.ctrl[1]} ${
                auto.mode
                ? config.blocks
                : 1
            }`;
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
            $(".n", clone),
            function (el) {
                el.textContent = setN(true);
            },
            setN()
        );
        ctrl(
            $(".speaker", clone),
            function (el) {
                el.textContent = speaker(true);
            },
            speaker()
        );
        ctrl(
            $(".x", clone),
            function (el) {
                el.textContent = setX(true);
            },
            setX()
        );
        ctrl(
            $(".help", clone),
            help,
            "?"
        );
        ctrl(
            $(".screen", clone),
            fscreen
        );
        if (!document.fullscreenEnabled) {
            $(".screen", clone).className = "none";
        }
        [auto.count, auto.sum] = [0, 0];
        board.append(clone);
    }
    function build(stim, olap) {
        let [i, t, stm, trg] = [0, 0, "", []];
        const s = new Array(trials);
        const sample = () => stim[Math.floor(Math.random() * stim.length)];
        if (olap) {
            trg = prevTargets.splice(0, config.overlap);
        } else {
            idx = [...new Array(trials - N).keys()].map((inc) => N + inc);
        }
        while (trg.length < config.targets) {
            trg.push(idx.splice(
                Math.floor(Math.random() * idx.length),
                1
            )[0]);
        }
        prevTargets = trg;
        trg.sort((a, b) => a - b);
        while (i < config.targets) {
            t = trg[i];
            stm = sample();
            while (stm === s[t - N * 2]) {
                stm = sample();
            }
            if (s[t - N]) {
                stm = s[t - N];
            }
            [s[t - N], s[t]] = [stm, stm];
            i += 1;
        }
        i = 0;
        while (i < trials) {
            while (!s[i]) {
                stm = sample();
                if (stm !== s[i - N] && stm !== s[i + N]) {
                    s[i] = stm;
                }
            }
            i += 1;
        }
        return s;
    }
    function btn(match, id) {
        if (!btn.fired || btn.fired[id]) {
            return;
        }
        if (match) {
            btn[id][0] += 1;
        } else {
            btn[id][1] += 1;
        }
        btn.fired[id] = true;
    }
    function btns() {
        const clone = $("#tmpl-2", head).content.cloneNode(true);
        const ul = [...$(".btns", clone).children];
        $("div.btns")?.remove();
        if (board.className && !auto.circle) {
            ctrl(
                ul[0],
                () => btn(V.bool, 1),
                lang.btns[0]
            );
            ctrl(
                ul[1],
                () => btn(A.bool, 2),
                lang.btns[1]
            );
            if (!config.sound) {
                ul[1].className = "none";
            }
            board.append(clone);
        }
        if (!board.className) {
            const el = create("div", board);
            el.className = "btns btns-toggle";
            el.textContent = `${lang.btns[2]}${
                config.buttons
                ? lang.btns[3]
                : lang.btns[4]
            }`;
        }
    }
    function cursor(e) {
        board.classList.remove("no-cursor");
        clearTimeout(cursorOff);
        if (e.target === board) {
            cursorOff = setTimeout(
                () => board.classList.add("no-cursor"),
                1200
            );
        }
    }
    function clear() {
        clearTimeout(delay);
        clearInterval(timer);
        [...$(".grid").children].forEach((el) => el.classList.remove("visual"));
        speech?.cancel();
        wakeReq?.release();
    }
    function run() {
        function state() {
            if (count === trials) {
                clear();
                result();
                return;
            }
            const vStm = V.block[count];
            const aStm = A.block[count];
            const sq = $(vStm);
            V.bool = vStm === V.block[count - N];
            A.bool = aStm === A.block[count - N];
            btn.fired = {
                "1": false,
                "2": false
            };
            count += 1;
            if (document.hidden) {
                return;
            }
            requestAnimationFrame(function () {
                sq.classList.add("visual");
                if (config.sound) {
                    speak(aStm);
                }
            });
            sq.addEventListener("animationend", function () {
                sq.classList.remove("visual");
            }, {once: true});
        }
        delay = setTimeout(function () {
            state();
            timer = setInterval(state, config.timeRate);
        }, 2100);
    }
    function task() {
        prep();
        [btn[1], btn[2], count, auto.circle] = [[0, 0], [0, 0], 0, false];
        delete btn.fired;
        board.className = "task";
        if (config.buttons) {
            btns();
        } else {
            board.classList.add("no-cursor");
            board.addEventListener("mousemove", cursor);
        }
        targets = (
            config.sound
            ? config.targets * 2
            : config.targets
        );
        if (
            N + targets - (
                config.overlapCtrl
                ? config.overlap
                : 0
            ) > trials
        ) {
            error(0);
            return;
        }
        V.block = build([
            ".s-1", ".s-2", ".s-3", ".s-4",
            ".s-5", ".s-6", ".s-7", ".s-8"
        ]);
        A.block = build(lang.aural, config.overlapCtrl);
        speak(" ", 0);
        wake();
        run();
    }
    function result() {
        const clone = $("#tmpl-3", head).content.cloneNode(true);
        const [r1, w1, r2, w2] = [
            btn[1][0], btn[1][1],
            btn[2][0], btn[2][1]
        ];
        const diff = (r1 + r2) - (w1 + w2);
        const data = [
            `${lang.res[0]}: ${
                diff > 0
                ? Math.round((diff / targets) * 100)
                : 0
            }%`
        ];
        if (auto.mode) {
            auto.count += 1;
            auto.sum += N;
            if (auto.count !== config.blocks) {
                const circle = $(".circle", clone);
                const [m1, m2] = [
                    config.targets - r1 + w1,
                    config.targets - r2 + w2
                ];
                if (
                    m1 < config.autoUp && (
                        config.sound
                        ? m2 < config.autoUp
                        : true
                    )
                ) {
                    N += 1;
                } else if (
                    N > config.limitMin &&
                    (m1 > config.autoDown || m2 > config.autoDown)
                ) {
                    N -= 1;
                }
                setTrials();
                $(".btns")?.remove();
                ctrl(
                    circle,
                    task
                );
                circle.classList.remove("none");
                auto.circle = true;
            }
            data.push(
                `${lang.res[1]}: ${auto.count} / ${config.blocks}`,
                `${
                    auto.count === config.blocks
                    ? `${lang.res[2]}: ${Math.round(auto.sum / config.blocks)}`
                    : `${lang.res[3]}: ${N}`
                }${lang.res[4]}`
            );
        } else {
            data.push(
                `${lang.res[5]}: ${r1 + r2} / ${targets}`,
                `${lang.res[6]}: ${w1 + w2}`
            );
        }
        data.forEach(function (txt, i) {
            clone.children[0].children[i].textContent = txt;
        });
        if (!document.hidden) {
            playAlert();
        }
        board.append(clone);
    }
    document.addEventListener("touchstart", function (e) {
        e.preventDefault();
    }, {passive: false});
    loadLang().then(() => init());
}());

