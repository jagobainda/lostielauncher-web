export const THEME_EVENT = "replica:theme";

export const applyReplicaTheme = (root: HTMLElement, name: string, style: string): void => {
    root.setAttribute("style", style);
    root.dataset.theme = name;
    root.dispatchEvent(new CustomEvent(THEME_EVENT, { bubbles: true, detail: { name } }));
};

const showView = (root: HTMLElement, view: string): void => {
    root.querySelectorAll<HTMLElement>("[data-replica-view]").forEach(el => {
        el.hidden = el.dataset.replicaView !== view;
    });
    root.querySelectorAll<HTMLElement>("[data-replica-nav]").forEach(el => {
        if (el.dataset.replicaNav === view) el.setAttribute("aria-current", "page");
        else el.removeAttribute("aria-current");
    });
    root.querySelectorAll<HTMLElement>("[data-replica-visible-in]").forEach(el => {
        el.hidden = !el.dataset.replicaVisibleIn?.split(" ").includes(view);
    });
    const title = root.querySelector<HTMLElement>(`[data-replica-view="${view}"]`)?.dataset.title;
    root.querySelectorAll<HTMLElement>("[data-replica-title]").forEach(el => {
        if (title) el.textContent = title;
    });
};

export const initReplica = (root: HTMLElement): void => {
    root.querySelectorAll<HTMLElement>("[data-replica-faqs]").forEach(initFaqSearch);
    root.querySelectorAll<HTMLDetailsElement>("[data-replica-theme-picker]").forEach(picker => {
        document.addEventListener("click", event => {
            if (event.target instanceof Node && !picker.contains(event.target)) picker.open = false;
        });
        picker.addEventListener("keydown", event => {
            if (event.key !== "Escape") return;
            picker.open = false;
            picker.querySelector("summary")?.focus();
        });
    });
    root.addEventListener("click", e => {
        const target = e.target instanceof Element ? e.target : null;
        const nav = target?.closest<HTMLElement>("[data-replica-nav]");
        if (nav?.dataset.replicaNav) showView(root, nav.dataset.replicaNav);
        const theme = target?.closest<HTMLElement>("[data-replica-theme]");
        if (theme?.dataset.replicaTheme && theme.dataset.themeStyle) {
            applyReplicaTheme(root, theme.dataset.replicaTheme, theme.dataset.themeStyle);
            theme.closest("details")?.removeAttribute("open");
        }
    });
    root.addEventListener(THEME_EVENT, e => {
        const name = (e as CustomEvent<{ name: string }>).detail.name;
        root.querySelectorAll<HTMLElement>("[data-replica-theme-name]").forEach(label => (label.textContent = name));
        root.querySelectorAll<HTMLElement>("[data-replica-theme]").forEach(el =>
            el.setAttribute("aria-pressed", String(el.dataset.replicaTheme === name)),
        );
    });
};

const foldSearch = (text: string): string =>
    text
        .normalize("NFD")
        .replace(/[\p{M}\p{Cf}]/gu, "")
        .replace(/(?<=l)·/gi, "")
        .toLowerCase();

export const initFaqSearch = (root: HTMLElement): void => {
    const input = root.querySelector<HTMLInputElement>("[data-faq-search]");
    const clear = root.querySelector<HTMLButtonElement>("[data-faq-clear]");
    const list = root.querySelector<HTMLElement>("[data-faq-results]");
    const empty = root.querySelector<HTMLElement>("[data-faq-empty]");
    const cards = [...root.querySelectorAll<HTMLDetailsElement>("[data-faq-card]")];
    if (!input || !clear || !list || !empty) return;
    const texts = cards.map(card =>
        [...card.querySelectorAll<HTMLElement>("[data-faq-text]")].map(element => ({
            element,
            original: element.innerHTML,
            text: foldSearch(element.textContent ?? ""),
        })),
    );
    const filter = () => {
        const term = foldSearch(input.value.trim());
        let count = 0;
        cards.forEach((card, index) => {
            card.hidden = !texts[index]?.some(({ text }) => text.includes(term));
            card.open = term.length > 0 && !card.hidden;
            if (!card.hidden) count++;
            texts[index]?.forEach(({ element, original }) => {
                element.innerHTML = original;
                if (!term || card.hidden) return;
                const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
                const nodes: Text[] = [];
                while (walker.nextNode()) nodes.push(walker.currentNode as Text);
                nodes.forEach(node => {
                    const value = node.data;
                    // Map folded characters back to their source offsets, including decomposed accents.
                    const offsets: number[] = [];
                    let folded = "";
                    for (let offset = 0; offset < value.length;) {
                        const character = String.fromCodePoint(value.codePointAt(offset)!);
                        const normalized = foldSearch(character);
                        if (!(character === "·" && folded.endsWith("l"))) {
                            folded += normalized;
                            for (let i = 0; i < normalized.length; i++) offsets.push(offset);
                        }
                        offset += character.length;
                    }
                    offsets.push(value.length);
                    let start = 0;
                    let found = folded.indexOf(term);
                    if (found < 0) return;
                    const fragment = document.createDocumentFragment();
                    while (found >= 0) {
                        const from = offsets[found]!;
                        const to = offsets[found + term.length]!;
                        fragment.append(value.slice(start, from));
                        const mark = document.createElement("mark");
                        mark.className = "bg-transparent text-(color:--lt-primary-fg) font-bold underline";
                        mark.textContent = value.slice(from, to);
                        fragment.append(mark);
                        start = to;
                        found = folded.indexOf(term, found + term.length);
                    }
                    fragment.append(value.slice(start));
                    node.replaceWith(fragment);
                });
            });
        });
        clear.hidden = input.value.length === 0;
        list.hidden = count === 0;
        empty.hidden = count !== 0;
    };
    input.addEventListener("input", filter);
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") input.blur();
    });
    clear.addEventListener("click", () => {
        input.value = "";
        filter();
        input.focus();
    });
};
