
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function once(fn) {
        let ran = false;
        return function (...args) {
            if (ran)
                return;
            ran = true;
            fn.call(this, ...args);
        };
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function self$1(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.50.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    var alea$1 = {exports: {}};

    (function (module) {
    // A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
    // http://baagoe.com/en/RandomMusings/javascript/
    // https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
    // Original work is under MIT license -

    // Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
    //
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be included in
    // all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    // THE SOFTWARE.



    (function(global, module, define) {

    function Alea(seed) {
      var me = this, mash = Mash();

      me.next = function() {
        var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
        me.s0 = me.s1;
        me.s1 = me.s2;
        return me.s2 = t - (me.c = t | 0);
      };

      // Apply the seeding algorithm from Baagoe.
      me.c = 1;
      me.s0 = mash(' ');
      me.s1 = mash(' ');
      me.s2 = mash(' ');
      me.s0 -= mash(seed);
      if (me.s0 < 0) { me.s0 += 1; }
      me.s1 -= mash(seed);
      if (me.s1 < 0) { me.s1 += 1; }
      me.s2 -= mash(seed);
      if (me.s2 < 0) { me.s2 += 1; }
      mash = null;
    }

    function copy(f, t) {
      t.c = f.c;
      t.s0 = f.s0;
      t.s1 = f.s1;
      t.s2 = f.s2;
      return t;
    }

    function impl(seed, opts) {
      var xg = new Alea(seed),
          state = opts && opts.state,
          prng = xg.next;
      prng.int32 = function() { return (xg.next() * 0x100000000) | 0; };
      prng.double = function() {
        return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
      };
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    function Mash() {
      var n = 0xefc8249d;

      var mash = function(data) {
        data = String(data);
        for (var i = 0; i < data.length; i++) {
          n += data.charCodeAt(i);
          var h = 0.02519603282416938 * n;
          n = h >>> 0;
          h -= n;
          h *= n;
          n = h >>> 0;
          h -= n;
          n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
      };

      return mash;
    }


    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.alea = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(alea$1));

    var xor128$1 = {exports: {}};

    (function (module) {
    // A Javascript implementaion of the "xor128" prng algorithm by
    // George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      me.x = 0;
      me.y = 0;
      me.z = 0;
      me.w = 0;

      // Set up generator function.
      me.next = function() {
        var t = me.x ^ (me.x << 11);
        me.x = me.y;
        me.y = me.z;
        me.z = me.w;
        return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
      };

      if (seed === (seed | 0)) {
        // Integer seed.
        me.x = seed;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 64; k++) {
        me.x ^= strseed.charCodeAt(k) | 0;
        me.next();
      }
    }

    function copy(f, t) {
      t.x = f.x;
      t.y = f.y;
      t.z = f.z;
      t.w = f.w;
      return t;
    }

    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xor128 = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(xor128$1));

    var xorwow$1 = {exports: {}};

    (function (module) {
    // A Javascript implementaion of the "xorwow" prng algorithm by
    // George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      // Set up generator function.
      me.next = function() {
        var t = (me.x ^ (me.x >>> 2));
        me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
        return (me.d = (me.d + 362437 | 0)) +
           (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
      };

      me.x = 0;
      me.y = 0;
      me.z = 0;
      me.w = 0;
      me.v = 0;

      if (seed === (seed | 0)) {
        // Integer seed.
        me.x = seed;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 64; k++) {
        me.x ^= strseed.charCodeAt(k) | 0;
        if (k == strseed.length) {
          me.d = me.x << 10 ^ me.x >>> 4;
        }
        me.next();
      }
    }

    function copy(f, t) {
      t.x = f.x;
      t.y = f.y;
      t.z = f.z;
      t.w = f.w;
      t.v = f.v;
      t.d = f.d;
      return t;
    }

    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xorwow = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(xorwow$1));

    var xorshift7$1 = {exports: {}};

    (function (module) {
    // A Javascript implementaion of the "xorshift7" algorithm by
    // François Panneton and Pierre L'ecuyer:
    // "On the Xorgshift Random Number Generators"
    // http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this;

      // Set up generator function.
      me.next = function() {
        // Update xor generator.
        var X = me.x, i = me.i, t, v;
        t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
        t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
        t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
        t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
        t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
        X[i] = v;
        me.i = (i + 1) & 7;
        return v;
      };

      function init(me, seed) {
        var j, X = [];

        if (seed === (seed | 0)) {
          // Seed state array using a 32-bit integer.
          X[0] = seed;
        } else {
          // Seed state using a string.
          seed = '' + seed;
          for (j = 0; j < seed.length; ++j) {
            X[j & 7] = (X[j & 7] << 15) ^
                (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
          }
        }
        // Enforce an array length of 8, not all zeroes.
        while (X.length < 8) X.push(0);
        for (j = 0; j < 8 && X[j] === 0; ++j);
        if (j == 8) X[7] = -1; else X[j];

        me.x = X;
        me.i = 0;

        // Discard an initial 256 values.
        for (j = 256; j > 0; --j) {
          me.next();
        }
      }

      init(me, seed);
    }

    function copy(f, t) {
      t.x = f.x.slice();
      t.i = f.i;
      return t;
    }

    function impl(seed, opts) {
      if (seed == null) seed = +(new Date);
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (state.x) copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xorshift7 = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(xorshift7$1));

    var xor4096$1 = {exports: {}};

    (function (module) {
    // A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
    //
    // This fast non-cryptographic random number generator is designed for
    // use in Monte-Carlo algorithms. It combines a long-period xorshift
    // generator with a Weyl generator, and it passes all common batteries
    // of stasticial tests for randomness while consuming only a few nanoseconds
    // for each prng generated.  For background on the generator, see Brent's
    // paper: "Some long-period random number generators using shifts and xors."
    // http://arxiv.org/pdf/1004.3115v1.pdf
    //
    // Usage:
    //
    // var xor4096 = require('xor4096');
    // random = xor4096(1);                        // Seed with int32 or string.
    // assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
    // assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
    //
    // For nonzero numeric keys, this impelementation provides a sequence
    // identical to that by Brent's xorgens 3 implementaion in C.  This
    // implementation also provides for initalizing the generator with
    // string seeds, or for saving and restoring the state of the generator.
    //
    // On Chrome, this prng benchmarks about 2.1 times slower than
    // Javascript's built-in Math.random().

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this;

      // Set up generator function.
      me.next = function() {
        var w = me.w,
            X = me.X, i = me.i, t, v;
        // Update Weyl generator.
        me.w = w = (w + 0x61c88647) | 0;
        // Update xor generator.
        v = X[(i + 34) & 127];
        t = X[i = ((i + 1) & 127)];
        v ^= v << 13;
        t ^= t << 17;
        v ^= v >>> 15;
        t ^= t >>> 12;
        // Update Xor generator array state.
        v = X[i] = v ^ t;
        me.i = i;
        // Result is the combination.
        return (v + (w ^ (w >>> 16))) | 0;
      };

      function init(me, seed) {
        var t, v, i, j, w, X = [], limit = 128;
        if (seed === (seed | 0)) {
          // Numeric seeds initialize v, which is used to generates X.
          v = seed;
          seed = null;
        } else {
          // String seeds are mixed into v and X one character at a time.
          seed = seed + '\0';
          v = 0;
          limit = Math.max(limit, seed.length);
        }
        // Initialize circular array and weyl value.
        for (i = 0, j = -32; j < limit; ++j) {
          // Put the unicode characters into the array, and shuffle them.
          if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
          // After 32 shuffles, take v as the starting w value.
          if (j === 0) w = v;
          v ^= v << 10;
          v ^= v >>> 15;
          v ^= v << 4;
          v ^= v >>> 13;
          if (j >= 0) {
            w = (w + 0x61c88647) | 0;     // Weyl.
            t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
            i = (0 == t) ? i + 1 : 0;     // Count zeroes.
          }
        }
        // We have detected all zeroes; make the key nonzero.
        if (i >= 128) {
          X[(seed && seed.length || 0) & 127] = -1;
        }
        // Run the generator 512 times to further mix the state before using it.
        // Factoring this as a function slows the main generator, so it is just
        // unrolled here.  The weyl generator is not advanced while warming up.
        i = 127;
        for (j = 4 * 128; j > 0; --j) {
          v = X[(i + 34) & 127];
          t = X[i = ((i + 1) & 127)];
          v ^= v << 13;
          t ^= t << 17;
          v ^= v >>> 15;
          t ^= t >>> 12;
          X[i] = v ^ t;
        }
        // Storing state as object members is faster than using closure variables.
        me.w = w;
        me.X = X;
        me.i = i;
      }

      init(me, seed);
    }

    function copy(f, t) {
      t.i = f.i;
      t.w = f.w;
      t.X = f.X.slice();
      return t;
    }
    function impl(seed, opts) {
      if (seed == null) seed = +(new Date);
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (state.X) copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.xor4096 = impl;
    }

    })(
      commonjsGlobal,                                     // window object or global
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(xor4096$1));

    var tychei$1 = {exports: {}};

    (function (module) {
    // A Javascript implementaion of the "Tyche-i" prng algorithm by
    // Samuel Neves and Filipe Araujo.
    // See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

    (function(global, module, define) {

    function XorGen(seed) {
      var me = this, strseed = '';

      // Set up generator function.
      me.next = function() {
        var b = me.b, c = me.c, d = me.d, a = me.a;
        b = (b << 25) ^ (b >>> 7) ^ c;
        c = (c - d) | 0;
        d = (d << 24) ^ (d >>> 8) ^ a;
        a = (a - b) | 0;
        me.b = b = (b << 20) ^ (b >>> 12) ^ c;
        me.c = c = (c - d) | 0;
        me.d = (d << 16) ^ (c >>> 16) ^ a;
        return me.a = (a - b) | 0;
      };

      /* The following is non-inverted tyche, which has better internal
       * bit diffusion, but which is about 25% slower than tyche-i in JS.
      me.next = function() {
        var a = me.a, b = me.b, c = me.c, d = me.d;
        a = (me.a + me.b | 0) >>> 0;
        d = me.d ^ a; d = d << 16 ^ d >>> 16;
        c = me.c + d | 0;
        b = me.b ^ c; b = b << 12 ^ d >>> 20;
        me.a = a = a + b | 0;
        d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
        me.c = c = c + d | 0;
        b = b ^ c;
        return me.b = (b << 7 ^ b >>> 25);
      }
      */

      me.a = 0;
      me.b = 0;
      me.c = 2654435769 | 0;
      me.d = 1367130551;

      if (seed === Math.floor(seed)) {
        // Integer seed.
        me.a = (seed / 0x100000000) | 0;
        me.b = seed | 0;
      } else {
        // String seed.
        strseed += seed;
      }

      // Mix in string seed, then discard an initial batch of 64 values.
      for (var k = 0; k < strseed.length + 20; k++) {
        me.b ^= strseed.charCodeAt(k) | 0;
        me.next();
      }
    }

    function copy(f, t) {
      t.a = f.a;
      t.b = f.b;
      t.c = f.c;
      t.d = f.d;
      return t;
    }
    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function() { return (xg.next() >>> 0) / 0x100000000; };
      prng.double = function() {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);
        return result;
      };
      prng.int32 = xg.next;
      prng.quick = prng;
      if (state) {
        if (typeof(state) == 'object') copy(state, xg);
        prng.state = function() { return copy(xg, {}); };
      }
      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function() { return impl; });
    } else {
      this.tychei = impl;
    }

    })(
      commonjsGlobal,
      module,    // present in node.js
      (typeof undefined) == 'function'    // present with an AMD loader
    );
    }(tychei$1));

    var seedrandom$1 = {exports: {}};

    /*
    Copyright 2019 David Bau.

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    */

    (function (module) {
    (function (global, pool, math) {
    //
    // The following constants are related to IEEE 754 limits.
    //

    var width = 256,        // each RC4 output is 0 <= x < 256
        chunks = 6,         // at least six RC4 outputs for each double
        digits = 52,        // there are 52 significant digits in a double
        rngname = 'random', // rngname: name for Math.random and Math.seedrandom
        startdenom = math.pow(width, chunks),
        significance = math.pow(2, digits),
        overflow = significance * 2,
        mask = width - 1,
        nodecrypto;         // node.js crypto module, initialized at the bottom.

    //
    // seedrandom()
    // This is the seedrandom function described above.
    //
    function seedrandom(seed, options, callback) {
      var key = [];
      options = (options == true) ? { entropy: true } : (options || {});

      // Flatten the seed string or build one from local entropy if needed.
      var shortseed = mixkey(flatten(
        options.entropy ? [seed, tostring(pool)] :
        (seed == null) ? autoseed() : seed, 3), key);

      // Use the seed to initialize an ARC4 generator.
      var arc4 = new ARC4(key);

      // This function returns a random double in [0, 1) that contains
      // randomness in every bit of the mantissa of the IEEE 754 value.
      var prng = function() {
        var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
            d = startdenom,                 //   and denominator d = 2 ^ 48.
            x = 0;                          //   and no 'extra last byte'.
        while (n < significance) {          // Fill up all significant digits by
          n = (n + x) * width;              //   shifting numerator and
          d *= width;                       //   denominator and generating a
          x = arc4.g(1);                    //   new least-significant-byte.
        }
        while (n >= overflow) {             // To avoid rounding up, before adding
          n /= 2;                           //   last byte, shift everything
          d /= 2;                           //   right using integer math until
          x >>>= 1;                         //   we have exactly the desired bits.
        }
        return (n + x) / d;                 // Form the number within [0, 1).
      };

      prng.int32 = function() { return arc4.g(4) | 0; };
      prng.quick = function() { return arc4.g(4) / 0x100000000; };
      prng.double = prng;

      // Mix the randomness into accumulated entropy.
      mixkey(tostring(arc4.S), pool);

      // Calling convention: what to return as a function of prng, seed, is_math.
      return (options.pass || callback ||
          function(prng, seed, is_math_call, state) {
            if (state) {
              // Load the arc4 state from the given state if it has an S array.
              if (state.S) { copy(state, arc4); }
              // Only provide the .state method if requested via options.state.
              prng.state = function() { return copy(arc4, {}); };
            }

            // If called as a method of Math (Math.seedrandom()), mutate
            // Math.random because that is how seedrandom.js has worked since v1.0.
            if (is_math_call) { math[rngname] = prng; return seed; }

            // Otherwise, it is a newer calling convention, so return the
            // prng directly.
            else return prng;
          })(
      prng,
      shortseed,
      'global' in options ? options.global : (this == math),
      options.state);
    }

    //
    // ARC4
    //
    // An ARC4 implementation.  The constructor takes a key in the form of
    // an array of at most (width) integers that should be 0 <= x < (width).
    //
    // The g(count) method returns a pseudorandom integer that concatenates
    // the next (count) outputs from ARC4.  Its return value is a number x
    // that is in the range 0 <= x < (width ^ count).
    //
    function ARC4(key) {
      var t, keylen = key.length,
          me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

      // The empty key [] is treated as [0].
      if (!keylen) { key = [keylen++]; }

      // Set up S using the standard key scheduling algorithm.
      while (i < width) {
        s[i] = i++;
      }
      for (i = 0; i < width; i++) {
        s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
        s[j] = t;
      }

      // The "g" method returns the next (count) outputs as one number.
      (me.g = function(count) {
        // Using instance members instead of closure state nearly doubles speed.
        var t, r = 0,
            i = me.i, j = me.j, s = me.S;
        while (count--) {
          t = s[i = mask & (i + 1)];
          r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
        }
        me.i = i; me.j = j;
        return r;
        // For robust unpredictability, the function call below automatically
        // discards an initial batch of values.  This is called RC4-drop[256].
        // See http://google.com/search?q=rsa+fluhrer+response&btnI
      })(width);
    }

    //
    // copy()
    // Copies internal state of ARC4 to or from a plain object.
    //
    function copy(f, t) {
      t.i = f.i;
      t.j = f.j;
      t.S = f.S.slice();
      return t;
    }
    //
    // flatten()
    // Converts an object tree to nested arrays of strings.
    //
    function flatten(obj, depth) {
      var result = [], typ = (typeof obj), prop;
      if (depth && typ == 'object') {
        for (prop in obj) {
          try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
        }
      }
      return (result.length ? result : typ == 'string' ? obj : obj + '\0');
    }

    //
    // mixkey()
    // Mixes a string seed into a key that is an array of integers, and
    // returns a shortened string seed that is equivalent to the result key.
    //
    function mixkey(seed, key) {
      var stringseed = seed + '', smear, j = 0;
      while (j < stringseed.length) {
        key[mask & j] =
          mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
      }
      return tostring(key);
    }

    //
    // autoseed()
    // Returns an object for autoseeding, using window.crypto and Node crypto
    // module if available.
    //
    function autoseed() {
      try {
        var out;
        if (nodecrypto && (out = nodecrypto.randomBytes)) {
          // The use of 'out' to remember randomBytes makes tight minified code.
          out = out(width);
        } else {
          out = new Uint8Array(width);
          (global.crypto || global.msCrypto).getRandomValues(out);
        }
        return tostring(out);
      } catch (e) {
        var browser = global.navigator,
            plugins = browser && browser.plugins;
        return [+new Date, global, plugins, global.screen, tostring(pool)];
      }
    }

    //
    // tostring()
    // Converts an array of charcodes to a string
    //
    function tostring(a) {
      return String.fromCharCode.apply(0, a);
    }

    //
    // When seedrandom.js is loaded, we immediately mix a few bits
    // from the built-in RNG into the entropy pool.  Because we do
    // not want to interfere with deterministic PRNG state later,
    // seedrandom will not call math.random on its own again after
    // initialization.
    //
    mixkey(math.random(), pool);

    //
    // Nodejs and AMD support: export the implementation as a module using
    // either convention.
    //
    if (module.exports) {
      module.exports = seedrandom;
      // When in node.js, try using crypto package for autoseeding.
      try {
        nodecrypto = require('crypto');
      } catch (ex) {}
    } else {
      // When included as a plain script, set up Math.seedrandom global.
      math['seed' + rngname] = seedrandom;
    }


    // End anonymous scope, and pass initial values.
    })(
      // global: `self` in browsers (including strict mode and web workers),
      // otherwise `this` in Node and other environments
      (typeof self !== 'undefined') ? self : commonjsGlobal,
      [],     // pool: entropy pool starts empty
      Math    // math: package containing random, pow, and seedrandom
    );
    }(seedrandom$1));

    // A library of seedable RNGs implemented in Javascript.
    //
    // Usage:
    //
    // var seedrandom = require('seedrandom');
    // var random = seedrandom(1); // or any seed.
    // var x = random();       // 0 <= x < 1.  Every bit is random.
    // var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

    // alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
    // Period: ~2^116
    // Reported to pass all BigCrush tests.
    var alea = alea$1.exports;

    // xor128, a pure xor-shift generator by George Marsaglia.
    // Period: 2^128-1.
    // Reported to fail: MatrixRank and LinearComp.
    var xor128 = xor128$1.exports;

    // xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
    // Period: 2^192-2^32
    // Reported to fail: CollisionOver, SimpPoker, and LinearComp.
    var xorwow = xorwow$1.exports;

    // xorshift7, by François Panneton and Pierre L'ecuyer, takes
    // a different approach: it adds robustness by allowing more shifts
    // than Marsaglia's original three.  It is a 7-shift generator
    // with 256 bits, that passes BigCrush with no systmatic failures.
    // Period 2^256-1.
    // No systematic BigCrush failures reported.
    var xorshift7 = xorshift7$1.exports;

    // xor4096, by Richard Brent, is a 4096-bit xor-shift with a
    // very long period that also adds a Weyl generator. It also passes
    // BigCrush with no systematic failures.  Its long period may
    // be useful if you have many generators and need to avoid
    // collisions.
    // Period: 2^4128-2^32.
    // No systematic BigCrush failures reported.
    var xor4096 = xor4096$1.exports;

    // Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
    // number generator derived from ChaCha, a modern stream cipher.
    // https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
    // Period: ~2^127
    // No systematic BigCrush failures reported.
    var tychei = tychei$1.exports;

    // The original ARC4-based prng included in this library.
    // Period: ~2^1600
    var sr = seedrandom$1.exports;

    sr.alea = alea;
    sr.xor128 = xor128;
    sr.xorwow = xorwow;
    sr.xorshift7 = xorshift7;
    sr.xor4096 = xor4096;
    sr.tychei = tychei;

    var seedrandom = sr;

    var GameMode;
    (function (GameMode) {
        GameMode[GameMode["daily"] = 0] = "daily";
        GameMode[GameMode["hourly"] = 1] = "hourly";
        GameMode[GameMode["infinite"] = 2] = "infinite";
        // "minutely",
    })(GameMode || (GameMode = {}));
    var ms;
    (function (ms) {
        ms[ms["SECOND"] = 1000] = "SECOND";
        ms[ms["MINUTE"] = 60000] = "MINUTE";
        ms[ms["HOUR"] = 3600000] = "HOUR";
        ms[ms["DAY"] = 86400000] = "DAY";
    })(ms || (ms = {}));

    const words$1 = {
        "words": [
            "tuffy",
            "cigar",
            "rebut",
            "sissy",
            "humph",
            "awake",
            "blush",
            "focal",
            "evade",
            "naval",
            "serve",
            "heath",
            "dwarf",
            "model",
            "karma",
            "stink",
            "grade",
            "quiet",
            "bench",
            "abate",
            "feign",
            "major",
            "death",
            "fresh",
            "crust",
            "stool",
            "colon",
            "abase",
            "marry",
            "react",
            "batty",
            "pride",
            "floss",
            "helix",
            "croak",
            "staff",
            "paper",
            "unfed",
            "whelp",
            "trawl",
            "outdo",
            "adobe",
            "crazy",
            "sower",
            "repay",
            "digit",
            "crate",
            "cluck",
            "spike",
            "mimic",
            "pound",
            "maxim",
            "linen",
            "unmet",
            "flesh",
            "booby",
            "forth",
            "first",
            "stand",
            "belly",
            "ivory",
            "seedy",
            "print",
            "yearn",
            "drain",
            "bribe",
            "stout",
            "panel",
            "crass",
            "flume",
            "offal",
            "agree",
            "error",
            "swirl",
            "argue",
            "bleed",
            "delta",
            "flick",
            "totem",
            "wooer",
            "front",
            "shrub",
            "parry",
            "biome",
            "lapel",
            "start",
            "greet",
            "goner",
            "golem",
            "lusty",
            "loopy",
            "round",
            "audit",
            "lying",
            "gamma",
            "labor",
            "islet",
            "civic",
            "forge",
            "corny",
            "moult",
            "basic",
            "salad",
            "agate",
            "spicy",
            "spray",
            "essay",
            "fjord",
            "spend",
            "kebab",
            "guild",
            "aback",
            "motor",
            "alone",
            "hatch",
            "hyper",
            "thumb",
            "dowry",
            "ought",
            "belch",
            "dutch",
            "pilot",
            "tweed",
            "comet",
            "jaunt",
            "enema",
            "steed",
            "abyss",
            "growl",
            "fling",
            "dozen",
            "boozy",
            "erode",
            "world",
            "gouge",
            "click",
            "briar",
            "great",
            "altar",
            "pulpy",
            "blurt",
            "coast",
            "duchy",
            "groin",
            "fixer",
            "group",
            "rogue",
            "badly",
            "smart",
            "pithy",
            "gaudy",
            "chill",
            "heron",
            "vodka",
            "finer",
            "surer",
            "radio",
            "rouge",
            "perch",
            "retch",
            "wrote",
            "clock",
            "tilde",
            "store",
            "prove",
            "bring",
            "solve",
            "cheat",
            "grime",
            "exult",
            "usher",
            "epoch",
            "triad",
            "break",
            "rhino",
            "viral",
            "conic",
            "masse",
            "sonic",
            "vital",
            "trace",
            "using",
            "peach",
            "champ",
            "baton",
            "brake",
            "pluck",
            "craze",
            "gripe",
            "weary",
            "picky",
            "acute",
            "ferry",
            "aside",
            "tapir",
            "troll",
            "unify",
            "rebus",
            "boost",
            "truss",
            "siege",
            "tiger",
            "banal",
            "slump",
            "crank",
            "gorge",
            "query",
            "drink",
            "favor",
            "abbey",
            "tangy",
            "panic",
            "solar",
            "shire",
            "proxy",
            "point",
            "robot",
            "prick",
            "wince",
            "crimp",
            "knoll",
            "sugar",
            "whack",
            "mount",
            "perky",
            "could",
            "wrung",
            "light",
            "those",
            "moist",
            "shard",
            "pleat",
            "aloft",
            "skill",
            "elder",
            "frame",
            "humor",
            "pause",
            "ulcer",
            "ultra",
            "robin",
            "cynic",
            "agora",
            "aroma",
            "caulk",
            "shake",
            "pupal",
            "dodge",
            "swill",
            "tacit",
            "other",
            "thorn",
            "trove",
            "bloke",
            "vivid",
            "spill",
            "chant",
            "choke",
            "rupee",
            "nasty",
            "mourn",
            "ahead",
            "brine",
            "cloth",
            "hoard",
            "sweet",
            "month",
            "lapse",
            "watch",
            "today",
            "focus",
            "smelt",
            "tease",
            "cater",
            "movie",
            "lynch",
            "saute",
            "allow",
            "renew",
            "their",
            "slosh",
            "purge",
            "chest",
            "depot",
            "epoxy",
            "nymph",
            "found",
            "shall",
            "harry",
            "stove",
            "lowly",
            "snout",
            "trope",
            "fewer",
            "shawl",
            "natal",
            "fibre",
            "comma",
            "foray",
            "scare",
            "stair",
            "black",
            "squad",
            "royal",
            "chunk",
            "mince",
            "slave",
            "shame",
            "cheek",
            "ample",
            "flair",
            "foyer",
            "cargo",
            "oxide",
            "plant",
            "olive",
            "inert",
            "askew",
            "heist",
            "shown",
            "zesty",
            "hasty",
            "trash",
            "fella",
            "larva",
            "forgo",
            "story",
            "hairy",
            "train",
            "homer",
            "badge",
            "midst",
            "canny",
            "fetus",
            "butch",
            "farce",
            "slung",
            "tipsy",
            "metal",
            "yield",
            "delve",
            "being",
            "scour",
            "glass",
            "gamer",
            "scrap",
            "money",
            "hinge",
            "album",
            "vouch",
            "asset",
            "tiara",
            "crept",
            "bayou",
            "atoll",
            "manor",
            "creak",
            "showy",
            "phase",
            "froth",
            "depth",
            "gloom",
            "flood",
            "trait",
            "girth",
            "piety",
            "payer",
            "goose",
            "float",
            "donor",
            "atone",
            "primo",
            "apron",
            "blown",
            "cacao",
            "loser",
            "input",
            "gloat",
            "awful",
            "brink",
            "smite",
            "beady",
            "rusty",
            "retro",
            "droll",
            "gawky",
            "hutch",
            "pinto",
            "gaily",
            "egret",
            "lilac",
            "sever",
            "field",
            "fluff",
            "hydro",
            "flack",
            "agape",
            "wench",
            "voice",
            "stead",
            "stalk",
            "berth",
            "madam",
            "night",
            "bland",
            "liver",
            "wedge",
            "augur",
            "roomy",
            "wacky",
            "flock",
            "angry",
            "bobby",
            "trite",
            "aphid",
            "tryst",
            "midge",
            "power",
            "elope",
            "cinch",
            "motto",
            "stomp",
            "upset",
            "bluff",
            "cramp",
            "quart",
            "coyly",
            "youth",
            "rhyme",
            "buggy",
            "alien",
            "smear",
            "unfit",
            "patty",
            "cling",
            "glean",
            "label",
            "hunky",
            "khaki",
            "poker",
            "gruel",
            "twice",
            "twang",
            "shrug",
            "treat",
            "unlit",
            "waste",
            "merit",
            "woven",
            "octal",
            "needy",
            "clown",
            "widow",
            "irony",
            "ruder",
            "gauze",
            "chief",
            "onset",
            "prize",
            "fungi",
            "charm",
            "gully",
            "inter",
            "whoop",
            "taunt",
            "leery",
            "class",
            "theme",
            "lofty",
            "tibia",
            "booze",
            "alpha",
            "thyme",
            "eclat",
            "doubt",
            "parer",
            "chute",
            "stick",
            "trice",
            "alike",
            "sooth",
            "recap",
            "saint",
            "liege",
            "glory",
            "grate",
            "admit",
            "brisk",
            "soggy",
            "usurp",
            "scald",
            "scorn",
            "leave",
            "twine",
            "sting",
            "bough",
            "marsh",
            "sloth",
            "dandy",
            "vigor",
            "howdy",
            "enjoy",
            "valid",
            "ionic",
            "equal",
            "unset",
            "floor",
            "catch",
            "spade",
            "stein",
            "exist",
            "quirk",
            "denim",
            "grove",
            "spiel",
            "mummy",
            "fault",
            "foggy",
            "flout",
            "carry",
            "sneak",
            "libel",
            "waltz",
            "aptly",
            "piney",
            "inept",
            "aloud",
            "photo",
            "dream",
            "stale",
            "vomit",
            "ombre",
            "fanny",
            "unite",
            "snarl",
            "baker",
            "there",
            "glyph",
            "pooch",
            "hippy",
            "spell",
            "folly",
            "louse",
            "gulch",
            "vault",
            "godly",
            "threw",
            "fleet",
            "grave",
            "inane",
            "shock",
            "crave",
            "spite",
            "valve",
            "skimp",
            "claim",
            "rainy",
            "musty",
            "pique",
            "daddy",
            "quasi",
            "arise",
            "aging",
            "valet",
            "opium",
            "avert",
            "stuck",
            "recut",
            "mulch",
            "genre",
            "plume",
            "rifle",
            "count",
            "incur",
            "total",
            "wrest",
            "mocha",
            "deter",
            "study",
            "lover",
            "safer",
            "rivet",
            "funny",
            "smoke",
            "mound",
            "undue",
            "sedan",
            "pagan",
            "swine",
            "guile",
            "gusty",
            "equip",
            "tough",
            "canoe",
            "chaos",
            "covet",
            "human",
            "udder",
            "lunch",
            "blast",
            "stray",
            "manga",
            "melee",
            "lefty",
            "quick",
            "paste",
            "given",
            "octet",
            "risen",
            "groan",
            "leaky",
            "grind",
            "carve",
            "loose",
            "sadly",
            "spilt",
            "apple",
            "slack",
            "honey",
            "final",
            "sheen",
            "eerie",
            "minty",
            "slick",
            "derby",
            "wharf",
            "spelt",
            "coach",
            "erupt",
            "singe",
            "price",
            "spawn",
            "fairy",
            "jiffy",
            "filmy",
            "stack",
            "chose",
            "sleep",
            "ardor",
            "nanny",
            "niece",
            "woozy",
            "handy",
            "grace",
            "ditto",
            "stank",
            "cream",
            "usual",
            "diode",
            "valor",
            "angle",
            "ninja",
            "muddy",
            "chase",
            "reply",
            "prone",
            "spoil",
            "heart",
            "shade",
            "diner",
            "arson",
            "onion",
            "sleet",
            "dowel",
            "couch",
            "palsy",
            "bowel",
            "smile",
            "evoke",
            "creek",
            "lance",
            "eagle",
            "idiot",
            "siren",
            "built",
            "embed",
            "award",
            "dross",
            "annul",
            "goody",
            "frown",
            "patio",
            "laden",
            "humid",
            "elite",
            "lymph",
            "edify",
            "might",
            "reset",
            "visit",
            "gusto",
            "purse",
            "vapor",
            "crock",
            "write",
            "sunny",
            "loath",
            "chaff",
            "slide",
            "queer",
            "venom",
            "stamp",
            "sorry",
            "still",
            "acorn",
            "aping",
            "pushy",
            "tamer",
            "hater",
            "mania",
            "awoke",
            "brawn",
            "swift",
            "exile",
            "birch",
            "lucky",
            "freer",
            "risky",
            "ghost",
            "plier",
            "lunar",
            "winch",
            "snare",
            "nurse",
            "house",
            "borax",
            "nicer",
            "lurch",
            "exalt",
            "about",
            "savvy",
            "toxin",
            "tunic",
            "pried",
            "inlay",
            "chump",
            "lanky",
            "cress",
            "eater",
            "elude",
            "cycle",
            "kitty",
            "boule",
            "moron",
            "tenet",
            "place",
            "lobby",
            "plush",
            "vigil",
            "index",
            "blink",
            "clung",
            "qualm",
            "croup",
            "clink",
            "juicy",
            "stage",
            "decay",
            "nerve",
            "flier",
            "shaft",
            "crook",
            "clean",
            "china",
            "ridge",
            "vowel",
            "gnome",
            "snuck",
            "icing",
            "spiny",
            "rigor",
            "snail",
            "flown",
            "rabid",
            "prose",
            "thank",
            "poppy",
            "budge",
            "fiber",
            "moldy",
            "dowdy",
            "kneel",
            "track",
            "caddy",
            "quell",
            "dumpy",
            "paler",
            "swore",
            "rebar",
            "scuba",
            "splat",
            "flyer",
            "horny",
            "mason",
            "doing",
            "ozone",
            "amply",
            "molar",
            "ovary",
            "beset",
            "queue",
            "cliff",
            "magic",
            "truce",
            "sport",
            "fritz",
            "edict",
            "twirl",
            "verse",
            "llama",
            "eaten",
            "range",
            "whisk",
            "hovel",
            "rehab",
            "macaw",
            "sigma",
            "spout",
            "verve",
            "sushi",
            "dying",
            "fetid",
            "brain",
            "buddy",
            "thump",
            "scion",
            "candy",
            "chord",
            "basin",
            "march",
            "crowd",
            "arbor",
            "gayly",
            "musky",
            "stain",
            "dally",
            "bless",
            "bravo",
            "stung",
            "title",
            "ruler",
            "kiosk",
            "blond",
            "ennui",
            "layer",
            "fluid",
            "tatty",
            "score",
            "cutie",
            "zebra",
            "barge",
            "matey",
            "bluer",
            "aider",
            "shook",
            "river",
            "privy",
            "betel",
            "frisk",
            "bongo",
            "begun",
            "azure",
            "weave",
            "genie",
            "sound",
            "glove",
            "braid",
            "scope",
            "wryly",
            "rover",
            "assay",
            "ocean",
            "bloom",
            "irate",
            "later",
            "woken",
            "silky",
            "wreck",
            "dwelt",
            "slate",
            "smack",
            "solid",
            "amaze",
            "hazel",
            "wrist",
            "jolly",
            "globe",
            "flint",
            "rouse",
            "civil",
            "vista",
            "relax",
            "cover",
            "alive",
            "beech",
            "jetty",
            "bliss",
            "vocal",
            "often",
            "dolly",
            "eight",
            "joker",
            "since",
            "event",
            "ensue",
            "shunt",
            "diver",
            "poser",
            "worst",
            "sweep",
            "alley",
            "creed",
            "anime",
            "leafy",
            "bosom",
            "dunce",
            "stare",
            "pudgy",
            "waive",
            "choir",
            "stood",
            "spoke",
            "outgo",
            "delay",
            "bilge",
            "ideal",
            "clasp",
            "seize",
            "hotly",
            "laugh",
            "sieve",
            "block",
            "meant",
            "grape",
            "noose",
            "hardy",
            "shied",
            "drawl",
            "daisy",
            "putty",
            "strut",
            "burnt",
            "tulip",
            "crick",
            "idyll",
            "vixen",
            "furor",
            "geeky",
            "cough",
            "naive",
            "shoal",
            "stork",
            "bathe",
            "aunty",
            "check",
            "prime",
            "brass",
            "outer",
            "furry",
            "razor",
            "elect",
            "evict",
            "imply",
            "demur",
            "quota",
            "haven",
            "cavil",
            "swear",
            "crump",
            "dough",
            "gavel",
            "wagon",
            "salon",
            "nudge",
            "harem",
            "pitch",
            "sworn",
            "pupil",
            "excel",
            "stony",
            "cabin",
            "unzip",
            "queen",
            "trout",
            "polyp",
            "earth",
            "storm",
            "until",
            "taper",
            "enter",
            "child",
            "adopt",
            "minor",
            "fatty",
            "husky",
            "brave",
            "filet",
            "slime",
            "glint",
            "tread",
            "steal",
            "regal",
            "guest",
            "every",
            "murky",
            "share",
            "spore",
            "hoist",
            "buxom",
            "inner",
            "otter",
            "dimly",
            "level",
            "sumac",
            "donut",
            "stilt",
            "arena",
            "sheet",
            "scrub",
            "fancy",
            "slimy",
            "pearl",
            "silly",
            "porch",
            "dingo",
            "sepia",
            "amble",
            "shady",
            "bread",
            "friar",
            "reign",
            "dairy",
            "quill",
            "cross",
            "brood",
            "tuber",
            "shear",
            "posit",
            "blank",
            "villa",
            "shank",
            "piggy",
            "freak",
            "which",
            "among",
            "fecal",
            "shell",
            "would",
            "algae",
            "large",
            "rabbi",
            "agony",
            "amuse",
            "bushy",
            "copse",
            "swoon",
            "knife",
            "pouch",
            "ascot",
            "plane",
            "crown",
            "urban",
            "snide",
            "relay",
            "abide",
            "viola",
            "rajah",
            "straw",
            "dilly",
            "crash",
            "amass",
            "third",
            "trick",
            "tutor",
            "woody",
            "blurb",
            "grief",
            "disco",
            "where",
            "sassy",
            "beach",
            "sauna",
            "comic",
            "clued",
            "creep",
            "caste",
            "graze",
            "snuff",
            "frock",
            "gonad",
            "drunk",
            "prong",
            "lurid",
            "steel",
            "halve",
            "buyer",
            "vinyl",
            "utile",
            "smell",
            "adage",
            "worry",
            "tasty",
            "local",
            "trade",
            "finch",
            "ashen",
            "modal",
            "gaunt",
            "clove",
            "enact",
            "adorn",
            "roast",
            "speck",
            "sheik",
            "missy",
            "grunt",
            "snoop",
            "party",
            "touch",
            "mafia",
            "emcee",
            "array",
            "south",
            "vapid",
            "jelly",
            "skulk",
            "angst",
            "tubal",
            "lower",
            "crest",
            "sweat",
            "cyber",
            "adore",
            "tardy",
            "swami",
            "notch",
            "groom",
            "roach",
            "hitch",
            "young",
            "align",
            "ready",
            "frond",
            "strap",
            "puree",
            "realm",
            "venue",
            "swarm",
            "offer",
            "seven",
            "dryer",
            "diary",
            "dryly",
            "drank",
            "acrid",
            "heady",
            "theta",
            "junto",
            "pixie",
            "quoth",
            "bonus",
            "shalt",
            "penne",
            "amend",
            "datum",
            "build",
            "piano",
            "shelf",
            "lodge",
            "suing",
            "rearm",
            "coral",
            "ramen",
            "worth",
            "psalm",
            "infer",
            "overt",
            "mayor",
            "ovoid",
            "glide",
            "usage",
            "poise",
            "randy",
            "chuck",
            "prank",
            "fishy",
            "tooth",
            "ether",
            "drove",
            "idler",
            "swath",
            "stint",
            "while",
            "begat",
            "apply",
            "slang",
            "tarot",
            "radar",
            "credo",
            "aware",
            "canon",
            "shift",
            "timer",
            "bylaw",
            "serum",
            "three",
            "steak",
            "iliac",
            "shirk",
            "blunt",
            "puppy",
            "penal",
            "joist",
            "bunny",
            "shape",
            "beget",
            "wheel",
            "adept",
            "stunt",
            "stole",
            "topaz",
            "chore",
            "fluke",
            "afoot",
            "bloat",
            "bully",
            "dense",
            "caper",
            "sneer",
            "boxer",
            "jumbo",
            "lunge",
            "space",
            "avail",
            "short",
            "slurp",
            "loyal",
            "flirt",
            "pizza",
            "conch",
            "tempo",
            "droop",
            "plate",
            "bible",
            "plunk",
            "afoul",
            "savoy",
            "steep",
            "agile",
            "stake",
            "dwell",
            "knave",
            "beard",
            "arose",
            "motif",
            "smash",
            "broil",
            "glare",
            "shove",
            "baggy",
            "mammy",
            "swamp",
            "along",
            "rugby",
            "wager",
            "quack",
            "squat",
            "snaky",
            "debit",
            "mange",
            "skate",
            "ninth",
            "joust",
            "tramp",
            "spurn",
            "medal",
            "micro",
            "rebel",
            "flank",
            "learn",
            "nadir",
            "maple",
            "comfy",
            "remit",
            "gruff",
            "ester",
            "least",
            "mogul",
            "fetch",
            "cause",
            "oaken",
            "aglow",
            "meaty",
            "gaffe",
            "shyly",
            "racer",
            "prowl",
            "thief",
            "stern",
            "poesy",
            "rocky",
            "tweet",
            "waist",
            "spire",
            "grope",
            "havoc",
            "patsy",
            "truly",
            "forty",
            "deity",
            "uncle",
            "swish",
            "giver",
            "preen",
            "bevel",
            "lemur",
            "draft",
            "slope",
            "annoy",
            "lingo",
            "bleak",
            "ditty",
            "curly",
            "cedar",
            "dirge",
            "grown",
            "horde",
            "drool",
            "shuck",
            "crypt",
            "cumin",
            "stock",
            "gravy",
            "locus",
            "wider",
            "breed",
            "quite",
            "chafe",
            "cache",
            "blimp",
            "deign",
            "fiend",
            "logic",
            "cheap",
            "elide",
            "rigid",
            "false",
            "renal",
            "pence",
            "rowdy",
            "shoot",
            "blaze",
            "envoy",
            "posse",
            "brief",
            "never",
            "abort",
            "mouse",
            "mucky",
            "sulky",
            "fiery",
            "media",
            "trunk",
            "yeast",
            "clear",
            "skunk",
            "scalp",
            "bitty",
            "cider",
            "koala",
            "duvet",
            "segue",
            "creme",
            "super",
            "grill",
            "after",
            "owner",
            "ember",
            "reach",
            "nobly",
            "empty",
            "speed",
            "gipsy",
            "recur",
            "smock",
            "dread",
            "merge",
            "burst",
            "kappa",
            "amity",
            "shaky",
            "hover",
            "carol",
            "snort",
            "synod",
            "faint",
            "haunt",
            "flour",
            "chair",
            "detox",
            "shrew",
            "tense",
            "plied",
            "quark",
            "burly",
            "novel",
            "waxen",
            "stoic",
            "jerky",
            "blitz",
            "beefy",
            "lyric",
            "hussy",
            "towel",
            "quilt",
            "below",
            "bingo",
            "wispy",
            "brash",
            "scone",
            "toast",
            "easel",
            "saucy",
            "value",
            "spice",
            "honor",
            "route",
            "sharp",
            "bawdy",
            "radii",
            "skull",
            "phony",
            "issue",
            "lager",
            "swell",
            "urine",
            "gassy",
            "trial",
            "flora",
            "upper",
            "latch",
            "wight",
            "brick",
            "retry",
            "holly",
            "decal",
            "grass",
            "shack",
            "dogma",
            "mover",
            "defer",
            "sober",
            "optic",
            "crier",
            "vying",
            "nomad",
            "flute",
            "hippo",
            "shark",
            "drier",
            "obese",
            "bugle",
            "tawny",
            "chalk",
            "feast",
            "ruddy",
            "pedal",
            "scarf",
            "cruel",
            "bleat",
            "tidal",
            "slush",
            "semen",
            "windy",
            "dusty",
            "sally",
            "igloo",
            "nerdy",
            "jewel",
            "shone",
            "whale",
            "hymen",
            "abuse",
            "fugue",
            "elbow",
            "crumb",
            "pansy",
            "welsh",
            "syrup",
            "terse",
            "suave",
            "gamut",
            "swung",
            "drake",
            "freed",
            "afire",
            "shirt",
            "grout",
            "oddly",
            "tithe",
            "plaid",
            "dummy",
            "broom",
            "blind",
            "torch",
            "enemy",
            "again",
            "tying",
            "pesky",
            "alter",
            "gazer",
            "noble",
            "ethos",
            "bride",
            "extol",
            "decor",
            "hobby",
            "beast",
            "idiom",
            "utter",
            "these",
            "sixth",
            "alarm",
            "erase",
            "elegy",
            "spunk",
            "piper",
            "scaly",
            "scold",
            "hefty",
            "chick",
            "sooty",
            "canal",
            "whiny",
            "slash",
            "quake",
            "joint",
            "swept",
            "prude",
            "heavy",
            "wield",
            "femme",
            "lasso",
            "maize",
            "shale",
            "screw",
            "spree",
            "smoky",
            "whiff",
            "scent",
            "glade",
            "spent",
            "prism",
            "stoke",
            "riper",
            "orbit",
            "cocoa",
            "guilt",
            "humus",
            "shush",
            "table",
            "smirk",
            "wrong",
            "noisy",
            "alert",
            "shiny",
            "elate",
            "resin",
            "whole",
            "hunch",
            "pixel",
            "polar",
            "hotel",
            "sword",
            "cleat",
            "mango",
            "rumba",
            "puffy",
            "filly",
            "billy",
            "leash",
            "clout",
            "dance",
            "ovate",
            "facet",
            "chili",
            "paint",
            "liner",
            "curio",
            "salty",
            "audio",
            "snake",
            "fable",
            "cloak",
            "navel",
            "spurt",
            "pesto",
            "balmy",
            "flash",
            "unwed",
            "early",
            "churn",
            "weedy",
            "stump",
            "lease",
            "witty",
            "wimpy",
            "spoof",
            "saner",
            "blend",
            "salsa",
            "thick",
            "warty",
            "manic",
            "blare",
            "squib",
            "spoon",
            "probe",
            "crepe",
            "knack",
            "force",
            "debut",
            "order",
            "haste",
            "teeth",
            "agent",
            "widen",
            "icily",
            "slice",
            "ingot",
            "clash",
            "juror",
            "blood",
            "abode",
            "throw",
            "unity",
            "pivot",
            "slept",
            "troop",
            "spare",
            "sewer",
            "parse",
            "morph",
            "cacti",
            "tacky",
            "spool",
            "demon",
            "moody",
            "annex",
            "begin",
            "fuzzy",
            "patch",
            "water",
            "lumpy",
            "admin",
            "omega",
            "limit",
            "tabby",
            "macho",
            "aisle",
            "skiff",
            "basis",
            "plank",
            "verge",
            "botch",
            "crawl",
            "lousy",
            "slain",
            "cubic",
            "raise",
            "wrack",
            "guide",
            "foist",
            "cameo",
            "under",
            "actor",
            "revue",
            "fraud",
            "harpy",
            "scoop",
            "climb",
            "refer",
            "olden",
            "clerk",
            "debar",
            "tally",
            "ethic",
            "cairn",
            "tulle",
            "ghoul",
            "hilly",
            "crude",
            "apart",
            "scale",
            "older",
            "plain",
            "sperm",
            "briny",
            "abbot",
            "rerun",
            "quest",
            "crisp",
            "bound",
            "befit",
            "drawn",
            "suite",
            "itchy",
            "cheer",
            "bagel",
            "guess",
            "broad",
            "axiom",
            "chard",
            "caput",
            "leant",
            "harsh",
            "curse",
            "proud",
            "swing",
            "opine",
            "taste",
            "lupus",
            "gumbo",
            "miner",
            "green",
            "chasm",
            "lipid",
            "topic",
            "armor",
            "brush",
            "crane",
            "mural",
            "abled",
            "habit",
            "bossy",
            "maker",
            "dusky",
            "dizzy",
            "lithe",
            "brook",
            "jazzy",
            "fifty",
            "sense",
            "giant",
            "surly",
            "legal",
            "fatal",
            "flunk",
            "began",
            "prune",
            "small",
            "slant",
            "scoff",
            "torus",
            "ninny",
            "covey",
            "viper",
            "taken",
            "moral",
            "vogue",
            "owing",
            "token",
            "entry",
            "booth",
            "voter",
            "chide",
            "elfin",
            "ebony",
            "neigh",
            "minim",
            "melon",
            "kneed",
            "decoy",
            "voila",
            "ankle",
            "arrow",
            "mushy",
            "tribe",
            "cease",
            "eager",
            "birth",
            "graph",
            "odder",
            "terra",
            "weird",
            "tried",
            "clack",
            "color",
            "rough",
            "weigh",
            "uncut",
            "ladle",
            "strip",
            "craft",
            "minus",
            "dicey",
            "titan",
            "lucid",
            "vicar",
            "dress",
            "ditch",
            "gypsy",
            "pasta",
            "taffy",
            "flame",
            "swoop",
            "aloof",
            "sight",
            "broke",
            "teary",
            "chart",
            "sixty",
            "wordy",
            "sheer",
            "leper",
            "nosey",
            "bulge",
            "savor",
            "clamp",
            "funky",
            "foamy",
            "toxic",
            "brand",
            "plumb",
            "dingy",
            "butte",
            "drill",
            "tripe",
            "bicep",
            "tenor",
            "krill",
            "worse",
            "drama",
            "hyena",
            "think",
            "ratio",
            "cobra",
            "basil",
            "scrum",
            "bused",
            "phone",
            "court",
            "camel",
            "proof",
            "heard",
            "angel",
            "petal",
            "pouty",
            "throb",
            "maybe",
            "fetal",
            "sprig",
            "spine",
            "shout",
            "cadet",
            "macro",
            "dodgy",
            "satyr",
            "rarer",
            "binge",
            "trend",
            "nutty",
            "leapt",
            "amiss",
            "split",
            "myrrh",
            "width",
            "sonar",
            "tower",
            "baron",
            "fever",
            "waver",
            "spark",
            "belie",
            "sloop",
            "expel",
            "smote",
            "baler",
            "above",
            "north",
            "wafer",
            "scant",
            "frill",
            "awash",
            "snack",
            "scowl",
            "frail",
            "drift",
            "limbo",
            "fence",
            "motel",
            "ounce",
            "wreak",
            "revel",
            "talon",
            "prior",
            "knelt",
            "cello",
            "flake",
            "debug",
            "anode",
            "crime",
            "salve",
            "scout",
            "imbue",
            "pinky",
            "stave",
            "vague",
            "chock",
            "fight",
            "video",
            "stone",
            "teach",
            "cleft",
            "frost",
            "prawn",
            "booty",
            "twist",
            "apnea",
            "stiff",
            "plaza",
            "ledge",
            "tweak",
            "board",
            "grant",
            "medic",
            "bacon",
            "cable",
            "brawl",
            "slunk",
            "raspy",
            "forum",
            "drone",
            "women",
            "mucus",
            "boast",
            "toddy",
            "coven",
            "tumor",
            "truer",
            "wrath",
            "stall",
            "steam",
            "axial",
            "purer",
            "daily",
            "trail",
            "niche",
            "mealy",
            "juice",
            "nylon",
            "plump",
            "merry",
            "flail",
            "papal",
            "wheat",
            "berry",
            "cower",
            "erect",
            "brute",
            "leggy",
            "snipe",
            "sinew",
            "skier",
            "penny",
            "jumpy",
            "rally",
            "umbra",
            "scary",
            "modem",
            "gross",
            "avian",
            "greed",
            "satin",
            "tonic",
            "parka",
            "sniff",
            "livid",
            "stark",
            "trump",
            "giddy",
            "reuse",
            "taboo",
            "avoid",
            "quote",
            "devil",
            "liken",
            "gloss",
            "gayer",
            "beret",
            "noise",
            "gland",
            "dealt",
            "sling",
            "rumor",
            "opera",
            "thigh",
            "tonga",
            "flare",
            "wound",
            "white",
            "bulky",
            "etude",
            "horse",
            "circa",
            "paddy",
            "inbox",
            "fizzy",
            "grain",
            "exert",
            "surge",
            "gleam",
            "belle",
            "salvo",
            "crush",
            "fruit",
            "sappy",
            "taker",
            "tract",
            "ovine",
            "spiky",
            "frank",
            "reedy",
            "filth",
            "spasm",
            "heave",
            "mambo",
            "right",
            "clank",
            "trust",
            "lumen",
            "borne",
            "spook",
            "sauce",
            "amber",
            "lathe",
            "carat",
            "corer",
            "dirty",
            "slyly",
            "affix",
            "alloy",
            "taint",
            "sheep",
            "kinky",
            "wooly",
            "mauve",
            "flung",
            "yacht",
            "fried",
            "quail",
            "brunt",
            "grimy",
            "curvy",
            "cagey",
            "rinse",
            "deuce",
            "state",
            "grasp",
            "milky",
            "bison",
            "graft",
            "sandy",
            "baste",
            "flask",
            "hedge",
            "girly",
            "swash",
            "boney",
            "coupe",
            "endow",
            "abhor",
            "welch",
            "blade",
            "tight",
            "geese",
            "miser",
            "mirth",
            "cloud",
            "cabal",
            "leech",
            "close",
            "tenth",
            "pecan",
            "droit",
            "grail",
            "clone",
            "guise",
            "ralph",
            "tango",
            "biddy",
            "smith",
            "mower",
            "payee",
            "serif",
            "drape",
            "fifth",
            "spank",
            "glaze",
            "allot",
            "truck",
            "kayak",
            "virus",
            "testy",
            "tepee",
            "fully",
            "zonal",
            "metro",
            "curry",
            "grand",
            "banjo",
            "axion",
            "bezel",
            "occur",
            "chain",
            "nasal",
            "gooey",
            "filer",
            "brace",
            "allay",
            "pubic",
            "raven",
            "plead",
            "gnash",
            "flaky",
            "munch",
            "dully",
            "eking",
            "thing",
            "slink",
            "hurry",
            "theft",
            "shorn",
            "pygmy",
            "ranch",
            "wring",
            "lemon",
            "shore",
            "mamma",
            "froze",
            "newer",
            "style",
            "moose",
            "antic",
            "drown",
            "vegan",
            "chess",
            "guppy",
            "union",
            "lever",
            "lorry",
            "image",
            "cabby",
            "druid",
            "exact",
            "truth",
            "dopey",
            "spear",
            "cried",
            "chime",
            "crony",
            "stunk",
            "timid",
            "batch",
            "gauge",
            "rotor",
            "crack",
            "curve",
            "latte",
            "witch",
            "bunch",
            "repel",
            "anvil",
            "soapy",
            "meter",
            "broth",
            "madly",
            "dried",
            "scene",
            "known",
            "magma",
            "roost",
            "woman",
            "thong",
            "punch",
            "pasty",
            "downy",
            "knead",
            "whirl",
            "rapid",
            "clang",
            "anger",
            "drive",
            "goofy",
            "email",
            "music",
            "stuff",
            "bleep",
            "rider",
            "mecca",
            "folio",
            "setup",
            "verso",
            "quash",
            "fauna",
            "gummy",
            "happy",
            "newly",
            "fussy",
            "relic",
            "guava",
            "ratty",
            "fudge",
            "femur",
            "chirp",
            "forte",
            "alibi",
            "whine",
            "petty",
            "golly",
            "plait",
            "fleck",
            "felon",
            "gourd",
            "brown",
            "thrum",
            "ficus",
            "stash",
            "decry",
            "wiser",
            "junta",
            "visor",
            "daunt",
            "scree",
            "impel",
            "await",
            "press",
            "whose",
            "turbo",
            "stoop",
            "speak",
            "mangy",
            "eying",
            "inlet",
            "crone",
            "pulse",
            "mossy",
            "staid",
            "hence",
            "pinch",
            "teddy",
            "sully",
            "snore",
            "ripen",
            "snowy",
            "attic",
            "going",
            "leach",
            "mouth",
            "hound",
            "clump",
            "tonal",
            "bigot",
            "peril",
            "piece",
            "blame",
            "haute",
            "spied",
            "undid",
            "intro",
            "basal",
            "shine",
            "gecko",
            "rodeo",
            "guard",
            "steer",
            "loamy",
            "scamp",
            "scram",
            "manly",
            "hello",
            "vaunt",
            "organ",
            "feral",
            "knock",
            "extra",
            "condo",
            "adapt",
            "willy",
            "polka",
            "rayon",
            "skirt",
            "faith",
            "torso",
            "match",
            "mercy",
            "tepid",
            "sleek",
            "riser",
            "twixt",
            "peace",
            "flush",
            "catty",
            "login",
            "eject",
            "roger",
            "rival",
            "untie",
            "refit",
            "aorta",
            "adult",
            "judge",
            "rower",
            "artsy",
            "rural",
            "shave"
        ],
        "valid": [
            "aahed",
            "aalii",
            "aargh",
            "aarti",
            "abaca",
            "abaci",
            "abacs",
            "abaft",
            "abaka",
            "abamp",
            "aband",
            "abash",
            "abask",
            "abaya",
            "abbas",
            "abbed",
            "abbes",
            "abcee",
            "abeam",
            "abear",
            "abele",
            "abers",
            "abets",
            "abies",
            "abler",
            "ables",
            "ablet",
            "ablow",
            "abmho",
            "abohm",
            "aboil",
            "aboma",
            "aboon",
            "abord",
            "abore",
            "abram",
            "abray",
            "abrim",
            "abrin",
            "abris",
            "absey",
            "absit",
            "abuna",
            "abune",
            "abuts",
            "abuzz",
            "abyes",
            "abysm",
            "acais",
            "acari",
            "accas",
            "accoy",
            "acerb",
            "acers",
            "aceta",
            "achar",
            "ached",
            "aches",
            "achoo",
            "acids",
            "acidy",
            "acing",
            "acini",
            "ackee",
            "acker",
            "acmes",
            "acmic",
            "acned",
            "acnes",
            "acock",
            "acold",
            "acred",
            "acres",
            "acros",
            "acted",
            "actin",
            "acton",
            "acyls",
            "adaws",
            "adays",
            "adbot",
            "addax",
            "added",
            "adder",
            "addio",
            "addle",
            "adeem",
            "adhan",
            "adieu",
            "adios",
            "adits",
            "adman",
            "admen",
            "admix",
            "adobo",
            "adown",
            "adoze",
            "adrad",
            "adred",
            "adsum",
            "aduki",
            "adunc",
            "adust",
            "advew",
            "adyta",
            "adzed",
            "adzes",
            "aecia",
            "aedes",
            "aegis",
            "aeons",
            "aerie",
            "aeros",
            "aesir",
            "afald",
            "afara",
            "afars",
            "afear",
            "aflaj",
            "afore",
            "afrit",
            "afros",
            "agama",
            "agami",
            "agars",
            "agast",
            "agave",
            "agaze",
            "agene",
            "agers",
            "agger",
            "aggie",
            "aggri",
            "aggro",
            "aggry",
            "aghas",
            "agila",
            "agios",
            "agism",
            "agist",
            "agita",
            "aglee",
            "aglet",
            "agley",
            "agloo",
            "aglus",
            "agmas",
            "agoge",
            "agone",
            "agons",
            "agood",
            "agria",
            "agrin",
            "agros",
            "agued",
            "agues",
            "aguna",
            "aguti",
            "aheap",
            "ahent",
            "ahigh",
            "ahind",
            "ahing",
            "ahint",
            "ahold",
            "ahull",
            "ahuru",
            "aidas",
            "aided",
            "aides",
            "aidoi",
            "aidos",
            "aiery",
            "aigas",
            "aight",
            "ailed",
            "aimed",
            "aimer",
            "ainee",
            "ainga",
            "aioli",
            "aired",
            "airer",
            "airns",
            "airth",
            "airts",
            "aitch",
            "aitus",
            "aiver",
            "aiyee",
            "aizle",
            "ajies",
            "ajiva",
            "ajuga",
            "ajwan",
            "akees",
            "akela",
            "akene",
            "aking",
            "akita",
            "akkas",
            "alaap",
            "alack",
            "alamo",
            "aland",
            "alane",
            "alang",
            "alans",
            "alant",
            "alapa",
            "alaps",
            "alary",
            "alate",
            "alays",
            "albas",
            "albee",
            "alcid",
            "alcos",
            "aldea",
            "alder",
            "aldol",
            "aleck",
            "alecs",
            "alefs",
            "aleft",
            "aleph",
            "alews",
            "aleye",
            "alfas",
            "algal",
            "algas",
            "algid",
            "algin",
            "algor",
            "algum",
            "alias",
            "alifs",
            "aline",
            "alist",
            "aliya",
            "alkie",
            "alkos",
            "alkyd",
            "alkyl",
            "allee",
            "allel",
            "allis",
            "allod",
            "allyl",
            "almah",
            "almas",
            "almeh",
            "almes",
            "almud",
            "almug",
            "alods",
            "aloed",
            "aloes",
            "aloha",
            "aloin",
            "aloos",
            "alowe",
            "altho",
            "altos",
            "alula",
            "alums",
            "alure",
            "alvar",
            "alway",
            "amahs",
            "amain",
            "amate",
            "amaut",
            "amban",
            "ambit",
            "ambos",
            "ambry",
            "ameba",
            "ameer",
            "amene",
            "amens",
            "ament",
            "amias",
            "amice",
            "amici",
            "amide",
            "amido",
            "amids",
            "amies",
            "amiga",
            "amigo",
            "amine",
            "amino",
            "amins",
            "amirs",
            "amlas",
            "amman",
            "ammon",
            "ammos",
            "amnia",
            "amnic",
            "amnio",
            "amoks",
            "amole",
            "amort",
            "amour",
            "amove",
            "amowt",
            "amped",
            "ampul",
            "amrit",
            "amuck",
            "amyls",
            "anana",
            "anata",
            "ancho",
            "ancle",
            "ancon",
            "andro",
            "anear",
            "anele",
            "anent",
            "angas",
            "anglo",
            "anigh",
            "anile",
            "anils",
            "anima",
            "animi",
            "anion",
            "anise",
            "anker",
            "ankhs",
            "ankus",
            "anlas",
            "annal",
            "annas",
            "annat",
            "anoas",
            "anole",
            "anomy",
            "ansae",
            "antae",
            "antar",
            "antas",
            "anted",
            "antes",
            "antis",
            "antra",
            "antre",
            "antsy",
            "anura",
            "anyon",
            "apace",
            "apage",
            "apaid",
            "apayd",
            "apays",
            "apeak",
            "apeek",
            "apers",
            "apert",
            "apery",
            "apgar",
            "aphis",
            "apian",
            "apiol",
            "apish",
            "apism",
            "apode",
            "apods",
            "apoop",
            "aport",
            "appal",
            "appay",
            "appel",
            "appro",
            "appui",
            "appuy",
            "apres",
            "apses",
            "apsis",
            "apsos",
            "apted",
            "apter",
            "aquae",
            "aquas",
            "araba",
            "araks",
            "arame",
            "arars",
            "arbas",
            "arced",
            "archi",
            "arcos",
            "arcus",
            "ardeb",
            "ardri",
            "aread",
            "areae",
            "areal",
            "arear",
            "areas",
            "areca",
            "aredd",
            "arede",
            "arefy",
            "areic",
            "arene",
            "arepa",
            "arere",
            "arete",
            "arets",
            "arett",
            "argal",
            "argan",
            "argil",
            "argle",
            "argol",
            "argon",
            "argot",
            "argus",
            "arhat",
            "arias",
            "ariel",
            "ariki",
            "arils",
            "ariot",
            "arish",
            "arked",
            "arled",
            "arles",
            "armed",
            "armer",
            "armet",
            "armil",
            "arnas",
            "arnut",
            "aroba",
            "aroha",
            "aroid",
            "arpas",
            "arpen",
            "arrah",
            "arras",
            "arret",
            "arris",
            "arroz",
            "arsed",
            "arses",
            "arsey",
            "arsis",
            "artal",
            "artel",
            "artic",
            "artis",
            "aruhe",
            "arums",
            "arval",
            "arvee",
            "arvos",
            "aryls",
            "asana",
            "ascon",
            "ascus",
            "asdic",
            "ashed",
            "ashes",
            "ashet",
            "asked",
            "asker",
            "askoi",
            "askos",
            "aspen",
            "asper",
            "aspic",
            "aspie",
            "aspis",
            "aspro",
            "assai",
            "assam",
            "asses",
            "assez",
            "assot",
            "aster",
            "astir",
            "astun",
            "asura",
            "asway",
            "aswim",
            "asyla",
            "ataps",
            "ataxy",
            "atigi",
            "atilt",
            "atimy",
            "atlas",
            "atman",
            "atmas",
            "atmos",
            "atocs",
            "atoke",
            "atoks",
            "atoms",
            "atomy",
            "atony",
            "atopy",
            "atria",
            "atrip",
            "attap",
            "attar",
            "atuas",
            "audad",
            "auger",
            "aught",
            "aulas",
            "aulic",
            "auloi",
            "aulos",
            "aumil",
            "aunes",
            "aunts",
            "aurae",
            "aural",
            "aurar",
            "auras",
            "aurei",
            "aures",
            "auric",
            "auris",
            "aurum",
            "autos",
            "auxin",
            "avale",
            "avant",
            "avast",
            "avels",
            "avens",
            "avers",
            "avgas",
            "avine",
            "avion",
            "avise",
            "aviso",
            "avize",
            "avows",
            "avyze",
            "awarn",
            "awato",
            "awave",
            "aways",
            "awdls",
            "aweel",
            "aweto",
            "awing",
            "awmry",
            "awned",
            "awner",
            "awols",
            "awork",
            "axels",
            "axile",
            "axils",
            "axing",
            "axite",
            "axled",
            "axles",
            "axman",
            "axmen",
            "axoid",
            "axone",
            "axons",
            "ayahs",
            "ayaya",
            "ayelp",
            "aygre",
            "ayins",
            "ayont",
            "ayres",
            "ayrie",
            "azans",
            "azide",
            "azido",
            "azine",
            "azlon",
            "azoic",
            "azole",
            "azons",
            "azote",
            "azoth",
            "azuki",
            "azurn",
            "azury",
            "azygy",
            "azyme",
            "azyms",
            "baaed",
            "baals",
            "babas",
            "babel",
            "babes",
            "babka",
            "baboo",
            "babul",
            "babus",
            "bacca",
            "bacco",
            "baccy",
            "bacha",
            "bachs",
            "backs",
            "baddy",
            "baels",
            "baffs",
            "baffy",
            "bafts",
            "baghs",
            "bagie",
            "bahts",
            "bahus",
            "bahut",
            "bails",
            "bairn",
            "baisa",
            "baith",
            "baits",
            "baiza",
            "baize",
            "bajan",
            "bajra",
            "bajri",
            "bajus",
            "baked",
            "baken",
            "bakes",
            "bakra",
            "balas",
            "balds",
            "baldy",
            "baled",
            "bales",
            "balks",
            "balky",
            "balls",
            "bally",
            "balms",
            "baloo",
            "balsa",
            "balti",
            "balun",
            "balus",
            "bambi",
            "banak",
            "banco",
            "bancs",
            "banda",
            "bandh",
            "bands",
            "bandy",
            "baned",
            "banes",
            "bangs",
            "bania",
            "banks",
            "banns",
            "bants",
            "bantu",
            "banty",
            "banya",
            "bapus",
            "barbe",
            "barbs",
            "barby",
            "barca",
            "barde",
            "bardo",
            "bards",
            "bardy",
            "bared",
            "barer",
            "bares",
            "barfi",
            "barfs",
            "baric",
            "barks",
            "barky",
            "barms",
            "barmy",
            "barns",
            "barny",
            "barps",
            "barra",
            "barre",
            "barro",
            "barry",
            "barye",
            "basan",
            "based",
            "basen",
            "baser",
            "bases",
            "basho",
            "basij",
            "basks",
            "bason",
            "basse",
            "bassi",
            "basso",
            "bassy",
            "basta",
            "basti",
            "basto",
            "basts",
            "bated",
            "bates",
            "baths",
            "batik",
            "batta",
            "batts",
            "battu",
            "bauds",
            "bauks",
            "baulk",
            "baurs",
            "bavin",
            "bawds",
            "bawks",
            "bawls",
            "bawns",
            "bawrs",
            "bawty",
            "bayed",
            "bayer",
            "bayes",
            "bayle",
            "bayts",
            "bazar",
            "bazoo",
            "beads",
            "beaks",
            "beaky",
            "beals",
            "beams",
            "beamy",
            "beano",
            "beans",
            "beany",
            "beare",
            "bears",
            "beath",
            "beats",
            "beaty",
            "beaus",
            "beaut",
            "beaux",
            "bebop",
            "becap",
            "becke",
            "becks",
            "bedad",
            "bedel",
            "bedes",
            "bedew",
            "bedim",
            "bedye",
            "beedi",
            "beefs",
            "beeps",
            "beers",
            "beery",
            "beets",
            "befog",
            "begad",
            "begar",
            "begem",
            "begot",
            "begum",
            "beige",
            "beigy",
            "beins",
            "bekah",
            "belah",
            "belar",
            "belay",
            "belee",
            "belga",
            "bells",
            "belon",
            "belts",
            "bemad",
            "bemas",
            "bemix",
            "bemud",
            "bends",
            "bendy",
            "benes",
            "benet",
            "benga",
            "benis",
            "benne",
            "benni",
            "benny",
            "bento",
            "bents",
            "benty",
            "bepat",
            "beray",
            "beres",
            "bergs",
            "berko",
            "berks",
            "berme",
            "berms",
            "berob",
            "beryl",
            "besat",
            "besaw",
            "besee",
            "beses",
            "besit",
            "besom",
            "besot",
            "besti",
            "bests",
            "betas",
            "beted",
            "betes",
            "beths",
            "betid",
            "beton",
            "betta",
            "betty",
            "bever",
            "bevor",
            "bevue",
            "bevvy",
            "bewet",
            "bewig",
            "bezes",
            "bezil",
            "bezzy",
            "bhais",
            "bhaji",
            "bhang",
            "bhats",
            "bhels",
            "bhoot",
            "bhuna",
            "bhuts",
            "biach",
            "biali",
            "bialy",
            "bibbs",
            "bibes",
            "biccy",
            "bices",
            "bided",
            "bider",
            "bides",
            "bidet",
            "bidis",
            "bidon",
            "bield",
            "biers",
            "biffo",
            "biffs",
            "biffy",
            "bifid",
            "bigae",
            "biggs",
            "biggy",
            "bigha",
            "bight",
            "bigly",
            "bigos",
            "bijou",
            "biked",
            "biker",
            "bikes",
            "bikie",
            "bilbo",
            "bilby",
            "biled",
            "biles",
            "bilgy",
            "bilks",
            "bills",
            "bimah",
            "bimas",
            "bimbo",
            "binal",
            "bindi",
            "binds",
            "biner",
            "bines",
            "bings",
            "bingy",
            "binit",
            "binks",
            "bints",
            "biogs",
            "biont",
            "biota",
            "biped",
            "bipod",
            "birds",
            "birks",
            "birle",
            "birls",
            "biros",
            "birrs",
            "birse",
            "birsy",
            "bises",
            "bisks",
            "bisom",
            "bitch",
            "biter",
            "bites",
            "bitos",
            "bitou",
            "bitsy",
            "bitte",
            "bitts",
            "bivia",
            "bivvy",
            "bizes",
            "bizzo",
            "bizzy",
            "blabs",
            "blads",
            "blady",
            "blaer",
            "blaes",
            "blaff",
            "blags",
            "blahs",
            "blain",
            "blams",
            "blart",
            "blase",
            "blash",
            "blate",
            "blats",
            "blatt",
            "blaud",
            "blawn",
            "blaws",
            "blays",
            "blear",
            "blebs",
            "blech",
            "blees",
            "blent",
            "blert",
            "blest",
            "blets",
            "bleys",
            "blimy",
            "bling",
            "blini",
            "blins",
            "bliny",
            "blips",
            "blist",
            "blite",
            "blits",
            "blive",
            "blobs",
            "blocs",
            "blogs",
            "blook",
            "bloop",
            "blore",
            "blots",
            "blows",
            "blowy",
            "blubs",
            "blude",
            "bluds",
            "bludy",
            "blued",
            "blues",
            "bluet",
            "bluey",
            "bluid",
            "blume",
            "blunk",
            "blurs",
            "blype",
            "boabs",
            "boaks",
            "boars",
            "boart",
            "boats",
            "bobac",
            "bobak",
            "bobas",
            "bobol",
            "bobos",
            "bocca",
            "bocce",
            "bocci",
            "boche",
            "bocks",
            "boded",
            "bodes",
            "bodge",
            "bodhi",
            "bodle",
            "boeps",
            "boets",
            "boeuf",
            "boffo",
            "boffs",
            "bogan",
            "bogey",
            "boggy",
            "bogie",
            "bogle",
            "bogue",
            "bogus",
            "bohea",
            "bohos",
            "boils",
            "boing",
            "boink",
            "boite",
            "boked",
            "bokeh",
            "bokes",
            "bokos",
            "bolar",
            "bolas",
            "bolds",
            "boles",
            "bolix",
            "bolls",
            "bolos",
            "bolts",
            "bolus",
            "bomas",
            "bombe",
            "bombo",
            "bombs",
            "bonce",
            "bonds",
            "boned",
            "boner",
            "bones",
            "bongs",
            "bonie",
            "bonks",
            "bonne",
            "bonny",
            "bonza",
            "bonze",
            "booai",
            "booay",
            "boobs",
            "boody",
            "booed",
            "boofy",
            "boogy",
            "boohs",
            "books",
            "booky",
            "bools",
            "booms",
            "boomy",
            "boong",
            "boons",
            "boord",
            "boors",
            "boose",
            "boots",
            "boppy",
            "borak",
            "boral",
            "boras",
            "borde",
            "bords",
            "bored",
            "boree",
            "borel",
            "borer",
            "bores",
            "borgo",
            "boric",
            "borks",
            "borms",
            "borna",
            "boron",
            "borts",
            "borty",
            "bortz",
            "bosie",
            "bosks",
            "bosky",
            "boson",
            "bosun",
            "botas",
            "botel",
            "botes",
            "bothy",
            "botte",
            "botts",
            "botty",
            "bouge",
            "bouks",
            "boult",
            "bouns",
            "bourd",
            "bourg",
            "bourn",
            "bouse",
            "bousy",
            "bouts",
            "bovid",
            "bowat",
            "bowed",
            "bower",
            "bowes",
            "bowet",
            "bowie",
            "bowls",
            "bowne",
            "bowrs",
            "bowse",
            "boxed",
            "boxen",
            "boxes",
            "boxla",
            "boxty",
            "boyar",
            "boyau",
            "boyed",
            "boyfs",
            "boygs",
            "boyla",
            "boyos",
            "boysy",
            "bozos",
            "braai",
            "brach",
            "brack",
            "bract",
            "brads",
            "braes",
            "brags",
            "brail",
            "braks",
            "braky",
            "brame",
            "brane",
            "brank",
            "brans",
            "brant",
            "brast",
            "brats",
            "brava",
            "bravi",
            "braws",
            "braxy",
            "brays",
            "braza",
            "braze",
            "bream",
            "brede",
            "breds",
            "breem",
            "breer",
            "brees",
            "breid",
            "breis",
            "breme",
            "brens",
            "brent",
            "brere",
            "brers",
            "breve",
            "brews",
            "breys",
            "brier",
            "bries",
            "brigs",
            "briki",
            "briks",
            "brill",
            "brims",
            "brins",
            "brios",
            "brise",
            "briss",
            "brith",
            "brits",
            "britt",
            "brize",
            "broch",
            "brock",
            "brods",
            "brogh",
            "brogs",
            "brome",
            "bromo",
            "bronc",
            "brond",
            "brool",
            "broos",
            "brose",
            "brosy",
            "brows",
            "brugh",
            "bruin",
            "bruit",
            "brule",
            "brume",
            "brung",
            "brusk",
            "brust",
            "bruts",
            "buats",
            "buaze",
            "bubal",
            "bubas",
            "bubba",
            "bubbe",
            "bubby",
            "bubus",
            "buchu",
            "bucko",
            "bucks",
            "bucku",
            "budas",
            "budis",
            "budos",
            "buffa",
            "buffe",
            "buffi",
            "buffo",
            "buffs",
            "buffy",
            "bufos",
            "bufty",
            "buhls",
            "buhrs",
            "buiks",
            "buist",
            "bukes",
            "bulbs",
            "bulgy",
            "bulks",
            "bulla",
            "bulls",
            "bulse",
            "bumbo",
            "bumfs",
            "bumph",
            "bumps",
            "bumpy",
            "bunas",
            "bunce",
            "bunco",
            "bunde",
            "bundh",
            "bunds",
            "bundt",
            "bundu",
            "bundy",
            "bungs",
            "bungy",
            "bunia",
            "bunje",
            "bunjy",
            "bunko",
            "bunks",
            "bunns",
            "bunts",
            "bunty",
            "bunya",
            "buoys",
            "buppy",
            "buran",
            "buras",
            "burbs",
            "burds",
            "buret",
            "burfi",
            "burgh",
            "burgs",
            "burin",
            "burka",
            "burke",
            "burks",
            "burls",
            "burns",
            "buroo",
            "burps",
            "burqa",
            "burro",
            "burrs",
            "burry",
            "bursa",
            "burse",
            "busby",
            "buses",
            "busks",
            "busky",
            "bussu",
            "busti",
            "busts",
            "busty",
            "buteo",
            "butes",
            "butle",
            "butoh",
            "butts",
            "butty",
            "butut",
            "butyl",
            "buzzy",
            "bwana",
            "bwazi",
            "byded",
            "bydes",
            "byked",
            "bykes",
            "byres",
            "byrls",
            "byssi",
            "bytes",
            "byway",
            "caaed",
            "cabas",
            "caber",
            "cabob",
            "caboc",
            "cabre",
            "cacas",
            "cacks",
            "cacky",
            "cadee",
            "cades",
            "cadge",
            "cadgy",
            "cadie",
            "cadis",
            "cadre",
            "caeca",
            "caese",
            "cafes",
            "caffs",
            "caged",
            "cager",
            "cages",
            "cagot",
            "cahow",
            "caids",
            "cains",
            "caird",
            "cajon",
            "cajun",
            "caked",
            "cakes",
            "cakey",
            "calfs",
            "calid",
            "calif",
            "calix",
            "calks",
            "calla",
            "calls",
            "calms",
            "calmy",
            "calos",
            "calpa",
            "calps",
            "calve",
            "calyx",
            "caman",
            "camas",
            "cames",
            "camis",
            "camos",
            "campi",
            "campo",
            "camps",
            "campy",
            "camus",
            "caned",
            "caneh",
            "caner",
            "canes",
            "cangs",
            "canid",
            "canna",
            "canns",
            "canso",
            "canst",
            "canto",
            "cants",
            "canty",
            "capas",
            "caped",
            "capes",
            "capex",
            "caphs",
            "capiz",
            "caple",
            "capon",
            "capos",
            "capot",
            "capri",
            "capul",
            "carap",
            "carbo",
            "carbs",
            "carby",
            "cardi",
            "cards",
            "cardy",
            "cared",
            "carer",
            "cares",
            "caret",
            "carex",
            "carks",
            "carle",
            "carls",
            "carns",
            "carny",
            "carob",
            "carom",
            "caron",
            "carpi",
            "carps",
            "carrs",
            "carse",
            "carta",
            "carte",
            "carts",
            "carvy",
            "casas",
            "casco",
            "cased",
            "cases",
            "casks",
            "casky",
            "casts",
            "casus",
            "cates",
            "cauda",
            "cauks",
            "cauld",
            "cauls",
            "caums",
            "caups",
            "cauri",
            "causa",
            "cavas",
            "caved",
            "cavel",
            "caver",
            "caves",
            "cavie",
            "cawed",
            "cawks",
            "caxon",
            "ceaze",
            "cebid",
            "cecal",
            "cecum",
            "ceded",
            "ceder",
            "cedes",
            "cedis",
            "ceiba",
            "ceili",
            "ceils",
            "celeb",
            "cella",
            "celli",
            "cells",
            "celom",
            "celts",
            "cense",
            "cento",
            "cents",
            "centu",
            "ceorl",
            "cepes",
            "cerci",
            "cered",
            "ceres",
            "cerge",
            "ceria",
            "ceric",
            "cerne",
            "ceroc",
            "ceros",
            "certs",
            "certy",
            "cesse",
            "cesta",
            "cesti",
            "cetes",
            "cetyl",
            "cezve",
            "chace",
            "chack",
            "chaco",
            "chado",
            "chads",
            "chaft",
            "chais",
            "chals",
            "chams",
            "chana",
            "chang",
            "chank",
            "chape",
            "chaps",
            "chapt",
            "chara",
            "chare",
            "chark",
            "charr",
            "chars",
            "chary",
            "chats",
            "chave",
            "chavs",
            "chawk",
            "chaws",
            "chaya",
            "chays",
            "cheep",
            "chefs",
            "cheka",
            "chela",
            "chelp",
            "chemo",
            "chems",
            "chere",
            "chert",
            "cheth",
            "chevy",
            "chews",
            "chewy",
            "chiao",
            "chias",
            "chibs",
            "chica",
            "chich",
            "chico",
            "chics",
            "chiel",
            "chiks",
            "chile",
            "chimb",
            "chimo",
            "chimp",
            "chine",
            "ching",
            "chink",
            "chino",
            "chins",
            "chips",
            "chirk",
            "chirl",
            "chirm",
            "chiro",
            "chirr",
            "chirt",
            "chiru",
            "chits",
            "chive",
            "chivs",
            "chivy",
            "chizz",
            "choco",
            "chocs",
            "chode",
            "chogs",
            "choil",
            "choko",
            "choky",
            "chola",
            "choli",
            "cholo",
            "chomp",
            "chons",
            "choof",
            "chook",
            "choom",
            "choon",
            "chops",
            "chota",
            "chott",
            "chout",
            "choux",
            "chowk",
            "chows",
            "chubs",
            "chufa",
            "chuff",
            "chugs",
            "chums",
            "churl",
            "churr",
            "chuse",
            "chuts",
            "chyle",
            "chyme",
            "chynd",
            "cibol",
            "cided",
            "cides",
            "ciels",
            "ciggy",
            "cilia",
            "cills",
            "cimar",
            "cimex",
            "cinct",
            "cines",
            "cinqs",
            "cions",
            "cippi",
            "circs",
            "cires",
            "cirls",
            "cirri",
            "cisco",
            "cissy",
            "cists",
            "cital",
            "cited",
            "citer",
            "cites",
            "cives",
            "civet",
            "civie",
            "civvy",
            "clach",
            "clade",
            "clads",
            "claes",
            "clags",
            "clame",
            "clams",
            "clans",
            "claps",
            "clapt",
            "claro",
            "clart",
            "clary",
            "clast",
            "clats",
            "claut",
            "clave",
            "clavi",
            "claws",
            "clays",
            "cleck",
            "cleek",
            "cleep",
            "clefs",
            "clegs",
            "cleik",
            "clems",
            "clepe",
            "clept",
            "cleve",
            "clews",
            "clied",
            "clies",
            "clift",
            "clime",
            "cline",
            "clint",
            "clipe",
            "clips",
            "clipt",
            "clits",
            "cloam",
            "clods",
            "cloff",
            "clogs",
            "cloke",
            "clomb",
            "clomp",
            "clonk",
            "clons",
            "cloop",
            "cloot",
            "clops",
            "clote",
            "clots",
            "clour",
            "clous",
            "clows",
            "cloye",
            "cloys",
            "cloze",
            "clubs",
            "clues",
            "cluey",
            "clunk",
            "clype",
            "cnida",
            "coact",
            "coady",
            "coala",
            "coals",
            "coaly",
            "coapt",
            "coarb",
            "coate",
            "coati",
            "coats",
            "cobbs",
            "cobby",
            "cobia",
            "coble",
            "cobza",
            "cocas",
            "cocci",
            "cocco",
            "cocks",
            "cocky",
            "cocos",
            "codas",
            "codec",
            "coded",
            "coden",
            "coder",
            "codes",
            "codex",
            "codon",
            "coeds",
            "coffs",
            "cogie",
            "cogon",
            "cogue",
            "cohab",
            "cohen",
            "cohoe",
            "cohog",
            "cohos",
            "coifs",
            "coign",
            "coils",
            "coins",
            "coirs",
            "coits",
            "coked",
            "cokes",
            "colas",
            "colby",
            "colds",
            "coled",
            "coles",
            "coley",
            "colic",
            "colin",
            "colls",
            "colly",
            "colog",
            "colts",
            "colza",
            "comae",
            "comal",
            "comas",
            "combe",
            "combi",
            "combo",
            "combs",
            "comby",
            "comer",
            "comes",
            "comix",
            "commo",
            "comms",
            "commy",
            "compo",
            "comps",
            "compt",
            "comte",
            "comus",
            "coned",
            "cones",
            "coney",
            "confs",
            "conga",
            "conge",
            "congo",
            "conia",
            "conin",
            "conks",
            "conky",
            "conne",
            "conns",
            "conte",
            "conto",
            "conus",
            "convo",
            "cooch",
            "cooed",
            "cooee",
            "cooer",
            "cooey",
            "coofs",
            "cooks",
            "cooky",
            "cools",
            "cooly",
            "coomb",
            "cooms",
            "coomy",
            "coons",
            "coops",
            "coopt",
            "coost",
            "coots",
            "cooze",
            "copal",
            "copay",
            "coped",
            "copen",
            "coper",
            "copes",
            "coppy",
            "copra",
            "copsy",
            "coqui",
            "coram",
            "corbe",
            "corby",
            "cords",
            "cored",
            "cores",
            "corey",
            "corgi",
            "coria",
            "corks",
            "corky",
            "corms",
            "corni",
            "corno",
            "corns",
            "cornu",
            "corps",
            "corse",
            "corso",
            "cosec",
            "cosed",
            "coses",
            "coset",
            "cosey",
            "cosie",
            "costa",
            "coste",
            "costs",
            "cotan",
            "coted",
            "cotes",
            "coths",
            "cotta",
            "cotts",
            "coude",
            "coups",
            "courb",
            "courd",
            "coure",
            "cours",
            "couta",
            "couth",
            "coved",
            "coves",
            "covin",
            "cowal",
            "cowan",
            "cowed",
            "cowks",
            "cowls",
            "cowps",
            "cowry",
            "coxae",
            "coxal",
            "coxed",
            "coxes",
            "coxib",
            "coyau",
            "coyed",
            "coyer",
            "coypu",
            "cozed",
            "cozen",
            "cozes",
            "cozey",
            "cozie",
            "craal",
            "crabs",
            "crags",
            "craic",
            "craig",
            "crake",
            "crame",
            "crams",
            "crans",
            "crape",
            "craps",
            "crapy",
            "crare",
            "craws",
            "crays",
            "creds",
            "creel",
            "crees",
            "crems",
            "crena",
            "creps",
            "crepy",
            "crewe",
            "crews",
            "crias",
            "cribs",
            "cries",
            "crims",
            "crine",
            "crios",
            "cripe",
            "crips",
            "crise",
            "crith",
            "crits",
            "croci",
            "crocs",
            "croft",
            "crogs",
            "cromb",
            "crome",
            "cronk",
            "crons",
            "crool",
            "croon",
            "crops",
            "crore",
            "crost",
            "crout",
            "crows",
            "croze",
            "cruck",
            "crudo",
            "cruds",
            "crudy",
            "crues",
            "cruet",
            "cruft",
            "crunk",
            "cruor",
            "crura",
            "cruse",
            "crusy",
            "cruve",
            "crwth",
            "cryer",
            "ctene",
            "cubby",
            "cubeb",
            "cubed",
            "cuber",
            "cubes",
            "cubit",
            "cuddy",
            "cuffo",
            "cuffs",
            "cuifs",
            "cuing",
            "cuish",
            "cuits",
            "cukes",
            "culch",
            "culet",
            "culex",
            "culls",
            "cully",
            "culms",
            "culpa",
            "culti",
            "cults",
            "culty",
            "cumec",
            "cundy",
            "cunei",
            "cunit",
            "cunts",
            "cupel",
            "cupid",
            "cuppa",
            "cuppy",
            "curat",
            "curbs",
            "curch",
            "curds",
            "curdy",
            "cured",
            "curer",
            "cures",
            "curet",
            "curfs",
            "curia",
            "curie",
            "curli",
            "curls",
            "curns",
            "curny",
            "currs",
            "cursi",
            "curst",
            "cusec",
            "cushy",
            "cusks",
            "cusps",
            "cuspy",
            "cusso",
            "cusum",
            "cutch",
            "cuter",
            "cutes",
            "cutey",
            "cutin",
            "cutis",
            "cutto",
            "cutty",
            "cutup",
            "cuvee",
            "cuzes",
            "cwtch",
            "cyano",
            "cyans",
            "cycad",
            "cycas",
            "cyclo",
            "cyder",
            "cylix",
            "cymae",
            "cymar",
            "cymas",
            "cymes",
            "cymol",
            "cysts",
            "cytes",
            "cyton",
            "czars",
            "daals",
            "dabba",
            "daces",
            "dacha",
            "dacks",
            "dadah",
            "dadas",
            "dados",
            "daffs",
            "daffy",
            "dagga",
            "daggy",
            "dagos",
            "dahls",
            "daiko",
            "daine",
            "daint",
            "daker",
            "daled",
            "dales",
            "dalis",
            "dalle",
            "dalts",
            "daman",
            "damar",
            "dames",
            "damme",
            "damns",
            "damps",
            "dampy",
            "dancy",
            "dangs",
            "danio",
            "danks",
            "danny",
            "dants",
            "daraf",
            "darbs",
            "darcy",
            "dared",
            "darer",
            "dares",
            "darga",
            "dargs",
            "daric",
            "daris",
            "darks",
            "darky",
            "darns",
            "darre",
            "darts",
            "darzi",
            "dashi",
            "dashy",
            "datal",
            "dated",
            "dater",
            "dates",
            "datos",
            "datto",
            "daube",
            "daubs",
            "dauby",
            "dauds",
            "dault",
            "daurs",
            "dauts",
            "daven",
            "davit",
            "dawah",
            "dawds",
            "dawed",
            "dawen",
            "dawks",
            "dawns",
            "dawts",
            "dayan",
            "daych",
            "daynt",
            "dazed",
            "dazer",
            "dazes",
            "deads",
            "deair",
            "deals",
            "deans",
            "deare",
            "dearn",
            "dears",
            "deary",
            "deash",
            "deave",
            "deaws",
            "deawy",
            "debag",
            "debby",
            "debel",
            "debes",
            "debts",
            "debud",
            "debur",
            "debus",
            "debye",
            "decad",
            "decaf",
            "decan",
            "decko",
            "decks",
            "decos",
            "dedal",
            "deeds",
            "deedy",
            "deely",
            "deems",
            "deens",
            "deeps",
            "deere",
            "deers",
            "deets",
            "deeve",
            "deevs",
            "defat",
            "deffo",
            "defis",
            "defog",
            "degas",
            "degum",
            "degus",
            "deice",
            "deids",
            "deify",
            "deils",
            "deism",
            "deist",
            "deked",
            "dekes",
            "dekko",
            "deled",
            "deles",
            "delfs",
            "delft",
            "delis",
            "dells",
            "delly",
            "delos",
            "delph",
            "delts",
            "deman",
            "demes",
            "demic",
            "demit",
            "demob",
            "demoi",
            "demos",
            "dempt",
            "denar",
            "denay",
            "dench",
            "denes",
            "denet",
            "denis",
            "dents",
            "deoxy",
            "derat",
            "deray",
            "dered",
            "deres",
            "derig",
            "derma",
            "derms",
            "derns",
            "derny",
            "deros",
            "derro",
            "derry",
            "derth",
            "dervs",
            "desex",
            "deshi",
            "desis",
            "desks",
            "desse",
            "devas",
            "devel",
            "devis",
            "devon",
            "devos",
            "devot",
            "dewan",
            "dewar",
            "dewax",
            "dewed",
            "dexes",
            "dexie",
            "dhaba",
            "dhaks",
            "dhals",
            "dhikr",
            "dhobi",
            "dhole",
            "dholl",
            "dhols",
            "dhoti",
            "dhows",
            "dhuti",
            "diact",
            "dials",
            "diane",
            "diazo",
            "dibbs",
            "diced",
            "dicer",
            "dices",
            "dicht",
            "dicks",
            "dicky",
            "dicot",
            "dicta",
            "dicts",
            "dicty",
            "diddy",
            "didie",
            "didos",
            "didst",
            "diebs",
            "diels",
            "diene",
            "diets",
            "diffs",
            "dight",
            "dikas",
            "diked",
            "diker",
            "dikes",
            "dikey",
            "dildo",
            "dilli",
            "dills",
            "dimbo",
            "dimer",
            "dimes",
            "dimps",
            "dinar",
            "dined",
            "dines",
            "dinge",
            "dings",
            "dinic",
            "dinks",
            "dinky",
            "dinna",
            "dinos",
            "dints",
            "diols",
            "diota",
            "dippy",
            "dipso",
            "diram",
            "direr",
            "dirke",
            "dirks",
            "dirls",
            "dirts",
            "disas",
            "disci",
            "discs",
            "dishy",
            "disks",
            "disme",
            "dital",
            "ditas",
            "dited",
            "dites",
            "ditsy",
            "ditts",
            "ditzy",
            "divan",
            "divas",
            "dived",
            "dives",
            "divis",
            "divna",
            "divos",
            "divot",
            "divvy",
            "diwan",
            "dixie",
            "dixit",
            "diyas",
            "dizen",
            "djinn",
            "djins",
            "doabs",
            "doats",
            "dobby",
            "dobes",
            "dobie",
            "dobla",
            "dobra",
            "dobro",
            "docht",
            "docks",
            "docos",
            "docus",
            "doddy",
            "dodos",
            "doeks",
            "doers",
            "doest",
            "doeth",
            "doffs",
            "dogan",
            "doges",
            "dogey",
            "doggo",
            "doggy",
            "dogie",
            "dohyo",
            "doilt",
            "doily",
            "doits",
            "dojos",
            "dolce",
            "dolci",
            "doled",
            "doles",
            "dolia",
            "dolls",
            "dolma",
            "dolor",
            "dolos",
            "dolts",
            "domal",
            "domed",
            "domes",
            "domic",
            "donah",
            "donas",
            "donee",
            "doner",
            "donga",
            "dongs",
            "donko",
            "donna",
            "donne",
            "donny",
            "donsy",
            "doobs",
            "dooce",
            "doody",
            "dooks",
            "doole",
            "dools",
            "dooly",
            "dooms",
            "doomy",
            "doona",
            "doorn",
            "doors",
            "doozy",
            "dopas",
            "doped",
            "doper",
            "dopes",
            "dorad",
            "dorba",
            "dorbs",
            "doree",
            "dores",
            "doric",
            "doris",
            "dorks",
            "dorky",
            "dorms",
            "dormy",
            "dorps",
            "dorrs",
            "dorsa",
            "dorse",
            "dorts",
            "dorty",
            "dosai",
            "dosas",
            "dosed",
            "doseh",
            "doser",
            "doses",
            "dosha",
            "dotal",
            "doted",
            "doter",
            "dotes",
            "dotty",
            "douar",
            "douce",
            "doucs",
            "douks",
            "doula",
            "douma",
            "doums",
            "doups",
            "doura",
            "douse",
            "douts",
            "doved",
            "doven",
            "dover",
            "doves",
            "dovie",
            "dowar",
            "dowds",
            "dowed",
            "dower",
            "dowie",
            "dowle",
            "dowls",
            "dowly",
            "downa",
            "downs",
            "dowps",
            "dowse",
            "dowts",
            "doxed",
            "doxes",
            "doxie",
            "doyen",
            "doyly",
            "dozed",
            "dozer",
            "dozes",
            "drabs",
            "drack",
            "draco",
            "draff",
            "drags",
            "drail",
            "drams",
            "drant",
            "draps",
            "drats",
            "drave",
            "draws",
            "drays",
            "drear",
            "dreck",
            "dreed",
            "dreer",
            "drees",
            "dregs",
            "dreks",
            "drent",
            "drere",
            "drest",
            "dreys",
            "dribs",
            "drice",
            "dries",
            "drily",
            "drips",
            "dript",
            "droid",
            "droil",
            "droke",
            "drole",
            "drome",
            "drony",
            "droob",
            "droog",
            "drook",
            "drops",
            "dropt",
            "drouk",
            "drows",
            "drubs",
            "drugs",
            "drums",
            "drupe",
            "druse",
            "drusy",
            "druxy",
            "dryad",
            "dryas",
            "dsobo",
            "dsomo",
            "duads",
            "duals",
            "duans",
            "duars",
            "dubbo",
            "ducal",
            "ducat",
            "duces",
            "ducks",
            "ducky",
            "ducts",
            "duddy",
            "duded",
            "dudes",
            "duels",
            "duets",
            "duett",
            "duffs",
            "dufus",
            "duing",
            "duits",
            "dukas",
            "duked",
            "dukes",
            "dukka",
            "dulce",
            "dules",
            "dulia",
            "dulls",
            "dulse",
            "dumas",
            "dumbo",
            "dumbs",
            "dumka",
            "dumky",
            "dumps",
            "dunam",
            "dunch",
            "dunes",
            "dungs",
            "dungy",
            "dunks",
            "dunno",
            "dunny",
            "dunsh",
            "dunts",
            "duomi",
            "duomo",
            "duped",
            "duper",
            "dupes",
            "duple",
            "duply",
            "duppy",
            "dural",
            "duras",
            "dured",
            "dures",
            "durgy",
            "durns",
            "duroc",
            "duros",
            "duroy",
            "durra",
            "durrs",
            "durry",
            "durst",
            "durum",
            "durzi",
            "dusks",
            "dusts",
            "duxes",
            "dwaal",
            "dwale",
            "dwalm",
            "dwams",
            "dwang",
            "dwaum",
            "dweeb",
            "dwile",
            "dwine",
            "dyads",
            "dyers",
            "dyked",
            "dykes",
            "dykey",
            "dykon",
            "dynel",
            "dynes",
            "dzhos",
            "eagre",
            "ealed",
            "eales",
            "eaned",
            "eards",
            "eared",
            "earls",
            "earns",
            "earnt",
            "earst",
            "eased",
            "easer",
            "eases",
            "easle",
            "easts",
            "eathe",
            "eaved",
            "eaves",
            "ebbed",
            "ebbet",
            "ebons",
            "ebook",
            "ecads",
            "eched",
            "eches",
            "echos",
            "ecrus",
            "edema",
            "edged",
            "edger",
            "edges",
            "edile",
            "edits",
            "educe",
            "educt",
            "eejit",
            "eensy",
            "eeven",
            "eevns",
            "effed",
            "egads",
            "egers",
            "egest",
            "eggar",
            "egged",
            "egger",
            "egmas",
            "ehing",
            "eider",
            "eidos",
            "eigne",
            "eiked",
            "eikon",
            "eilds",
            "eisel",
            "ejido",
            "ekkas",
            "elain",
            "eland",
            "elans",
            "elchi",
            "eldin",
            "elemi",
            "elfed",
            "eliad",
            "elint",
            "elmen",
            "eloge",
            "elogy",
            "eloin",
            "elops",
            "elpee",
            "elsin",
            "elute",
            "elvan",
            "elven",
            "elver",
            "elves",
            "emacs",
            "embar",
            "embay",
            "embog",
            "embow",
            "embox",
            "embus",
            "emeer",
            "emend",
            "emerg",
            "emery",
            "emeus",
            "emics",
            "emirs",
            "emits",
            "emmas",
            "emmer",
            "emmet",
            "emmew",
            "emmys",
            "emoji",
            "emong",
            "emote",
            "emove",
            "empts",
            "emule",
            "emure",
            "emyde",
            "emyds",
            "enarm",
            "enate",
            "ended",
            "ender",
            "endew",
            "endue",
            "enews",
            "enfix",
            "eniac",
            "enlit",
            "enmew",
            "ennog",
            "enoki",
            "enols",
            "enorm",
            "enows",
            "enrol",
            "ensew",
            "ensky",
            "entia",
            "enure",
            "enurn",
            "envoi",
            "enzym",
            "eorls",
            "eosin",
            "epact",
            "epees",
            "ephah",
            "ephas",
            "ephod",
            "ephor",
            "epics",
            "epode",
            "epopt",
            "epris",
            "eques",
            "equid",
            "erbia",
            "erevs",
            "ergon",
            "ergos",
            "ergot",
            "erhus",
            "erica",
            "erick",
            "erics",
            "ering",
            "erned",
            "ernes",
            "erose",
            "erred",
            "erses",
            "eruct",
            "erugo",
            "eruvs",
            "erven",
            "ervil",
            "escar",
            "escot",
            "esile",
            "eskar",
            "esker",
            "esnes",
            "esses",
            "estoc",
            "estop",
            "estro",
            "etage",
            "etape",
            "etats",
            "etens",
            "ethal",
            "ethne",
            "ethyl",
            "etics",
            "etnas",
            "ettin",
            "ettle",
            "etuis",
            "etwee",
            "etyma",
            "eughs",
            "euked",
            "eupad",
            "euros",
            "eusol",
            "evens",
            "evert",
            "evets",
            "evhoe",
            "evils",
            "evite",
            "evohe",
            "ewers",
            "ewest",
            "ewhow",
            "ewked",
            "exams",
            "exeat",
            "execs",
            "exeem",
            "exeme",
            "exfil",
            "exies",
            "exine",
            "exing",
            "exits",
            "exode",
            "exome",
            "exons",
            "expat",
            "expos",
            "exude",
            "exuls",
            "exurb",
            "eyass",
            "eyers",
            "eyots",
            "eyras",
            "eyres",
            "eyrie",
            "eyrir",
            "ezine",
            "fabby",
            "faced",
            "facer",
            "faces",
            "facia",
            "facta",
            "facts",
            "faddy",
            "faded",
            "fader",
            "fades",
            "fadge",
            "fados",
            "faena",
            "faery",
            "faffs",
            "faffy",
            "faggy",
            "fagin",
            "fagot",
            "faiks",
            "fails",
            "faine",
            "fains",
            "fairs",
            "faked",
            "faker",
            "fakes",
            "fakey",
            "fakie",
            "fakir",
            "falaj",
            "falls",
            "famed",
            "fames",
            "fanal",
            "fands",
            "fanes",
            "fanga",
            "fango",
            "fangs",
            "fanks",
            "fanon",
            "fanos",
            "fanum",
            "faqir",
            "farad",
            "farci",
            "farcy",
            "fards",
            "fared",
            "farer",
            "fares",
            "farle",
            "farls",
            "farms",
            "faros",
            "farro",
            "farse",
            "farts",
            "fasci",
            "fasti",
            "fasts",
            "fated",
            "fates",
            "fatly",
            "fatso",
            "fatwa",
            "faugh",
            "fauld",
            "fauns",
            "faurd",
            "fauts",
            "fauve",
            "favas",
            "favel",
            "faver",
            "faves",
            "favus",
            "fawns",
            "fawny",
            "faxed",
            "faxes",
            "fayed",
            "fayer",
            "fayne",
            "fayre",
            "fazed",
            "fazes",
            "feals",
            "feare",
            "fears",
            "feart",
            "fease",
            "feats",
            "feaze",
            "feces",
            "fecht",
            "fecit",
            "fecks",
            "fedex",
            "feebs",
            "feeds",
            "feels",
            "feens",
            "feers",
            "feese",
            "feeze",
            "fehme",
            "feint",
            "feist",
            "felch",
            "felid",
            "fells",
            "felly",
            "felts",
            "felty",
            "femal",
            "femes",
            "femmy",
            "fends",
            "fendy",
            "fenis",
            "fenks",
            "fenny",
            "fents",
            "feods",
            "feoff",
            "ferer",
            "feres",
            "feria",
            "ferly",
            "fermi",
            "ferms",
            "ferns",
            "ferny",
            "fesse",
            "festa",
            "fests",
            "festy",
            "fetas",
            "feted",
            "fetes",
            "fetor",
            "fetta",
            "fetts",
            "fetwa",
            "feuar",
            "feuds",
            "feued",
            "feyed",
            "feyer",
            "feyly",
            "fezes",
            "fezzy",
            "fiars",
            "fiats",
            "fibro",
            "fices",
            "fiche",
            "fichu",
            "ficin",
            "ficos",
            "fides",
            "fidge",
            "fidos",
            "fiefs",
            "fient",
            "fiere",
            "fiers",
            "fiest",
            "fifed",
            "fifer",
            "fifes",
            "fifis",
            "figgy",
            "figos",
            "fiked",
            "fikes",
            "filar",
            "filch",
            "filed",
            "files",
            "filii",
            "filks",
            "fille",
            "fillo",
            "fills",
            "filmi",
            "films",
            "filos",
            "filum",
            "finca",
            "finds",
            "fined",
            "fines",
            "finis",
            "finks",
            "finny",
            "finos",
            "fiord",
            "fiqhs",
            "fique",
            "fired",
            "firer",
            "fires",
            "firie",
            "firks",
            "firms",
            "firns",
            "firry",
            "firth",
            "fiscs",
            "fisks",
            "fists",
            "fisty",
            "fitch",
            "fitly",
            "fitna",
            "fitte",
            "fitts",
            "fiver",
            "fives",
            "fixed",
            "fixes",
            "fixit",
            "fjeld",
            "flabs",
            "flaff",
            "flags",
            "flaks",
            "flamm",
            "flams",
            "flamy",
            "flane",
            "flans",
            "flaps",
            "flary",
            "flats",
            "flava",
            "flawn",
            "flaws",
            "flawy",
            "flaxy",
            "flays",
            "fleam",
            "fleas",
            "fleek",
            "fleer",
            "flees",
            "flegs",
            "fleme",
            "fleur",
            "flews",
            "flexi",
            "flexo",
            "fleys",
            "flics",
            "flied",
            "flies",
            "flimp",
            "flims",
            "flips",
            "flirs",
            "flisk",
            "flite",
            "flits",
            "flitt",
            "flobs",
            "flocs",
            "floes",
            "flogs",
            "flong",
            "flops",
            "flors",
            "flory",
            "flosh",
            "flota",
            "flote",
            "flows",
            "flubs",
            "flued",
            "flues",
            "fluey",
            "fluky",
            "flump",
            "fluor",
            "flurr",
            "fluty",
            "fluyt",
            "flyby",
            "flype",
            "flyte",
            "foals",
            "foams",
            "foehn",
            "fogey",
            "fogie",
            "fogle",
            "fogou",
            "fohns",
            "foids",
            "foils",
            "foins",
            "folds",
            "foley",
            "folia",
            "folic",
            "folie",
            "folks",
            "folky",
            "fomes",
            "fonda",
            "fonds",
            "fondu",
            "fones",
            "fonly",
            "fonts",
            "foods",
            "foody",
            "fools",
            "foots",
            "footy",
            "foram",
            "forbs",
            "forby",
            "fordo",
            "fords",
            "forel",
            "fores",
            "forex",
            "forks",
            "forky",
            "forme",
            "forms",
            "forts",
            "forza",
            "forze",
            "fossa",
            "fosse",
            "fouat",
            "fouds",
            "fouer",
            "fouet",
            "foule",
            "fouls",
            "fount",
            "fours",
            "fouth",
            "fovea",
            "fowls",
            "fowth",
            "foxed",
            "foxes",
            "foxie",
            "foyle",
            "foyne",
            "frabs",
            "frack",
            "fract",
            "frags",
            "fraim",
            "franc",
            "frape",
            "fraps",
            "frass",
            "frate",
            "frati",
            "frats",
            "fraus",
            "frays",
            "frees",
            "freet",
            "freit",
            "fremd",
            "frena",
            "freon",
            "frere",
            "frets",
            "fribs",
            "frier",
            "fries",
            "frigs",
            "frise",
            "frist",
            "frith",
            "frits",
            "fritt",
            "frize",
            "frizz",
            "froes",
            "frogs",
            "frons",
            "frore",
            "frorn",
            "frory",
            "frosh",
            "frows",
            "frowy",
            "frugs",
            "frump",
            "frush",
            "frust",
            "fryer",
            "fubar",
            "fubby",
            "fubsy",
            "fucks",
            "fucus",
            "fuddy",
            "fudgy",
            "fuels",
            "fuero",
            "fuffs",
            "fuffy",
            "fugal",
            "fuggy",
            "fugie",
            "fugio",
            "fugle",
            "fugly",
            "fugus",
            "fujis",
            "fulls",
            "fumed",
            "fumer",
            "fumes",
            "fumet",
            "fundi",
            "funds",
            "fundy",
            "fungo",
            "fungs",
            "funks",
            "fural",
            "furan",
            "furca",
            "furls",
            "furol",
            "furrs",
            "furth",
            "furze",
            "furzy",
            "fused",
            "fusee",
            "fusel",
            "fuses",
            "fusil",
            "fusks",
            "fusts",
            "fusty",
            "futon",
            "fuzed",
            "fuzee",
            "fuzes",
            "fuzil",
            "fyces",
            "fyked",
            "fykes",
            "fyles",
            "fyrds",
            "fytte",
            "gabba",
            "gabby",
            "gable",
            "gaddi",
            "gades",
            "gadge",
            "gadid",
            "gadis",
            "gadje",
            "gadjo",
            "gadso",
            "gaffs",
            "gaged",
            "gager",
            "gages",
            "gaids",
            "gains",
            "gairs",
            "gaita",
            "gaits",
            "gaitt",
            "gajos",
            "galah",
            "galas",
            "galax",
            "galea",
            "galed",
            "gales",
            "galls",
            "gally",
            "galop",
            "galut",
            "galvo",
            "gamas",
            "gamay",
            "gamba",
            "gambe",
            "gambo",
            "gambs",
            "gamed",
            "games",
            "gamey",
            "gamic",
            "gamin",
            "gamme",
            "gammy",
            "gamps",
            "ganch",
            "gandy",
            "ganef",
            "ganev",
            "gangs",
            "ganja",
            "ganof",
            "gants",
            "gaols",
            "gaped",
            "gaper",
            "gapes",
            "gapos",
            "gappy",
            "garbe",
            "garbo",
            "garbs",
            "garda",
            "gares",
            "garis",
            "garms",
            "garni",
            "garre",
            "garth",
            "garum",
            "gases",
            "gasps",
            "gaspy",
            "gasts",
            "gatch",
            "gated",
            "gater",
            "gates",
            "gaths",
            "gator",
            "gauch",
            "gaucy",
            "gauds",
            "gauje",
            "gault",
            "gaums",
            "gaumy",
            "gaups",
            "gaurs",
            "gauss",
            "gauzy",
            "gavot",
            "gawcy",
            "gawds",
            "gawks",
            "gawps",
            "gawsy",
            "gayal",
            "gazal",
            "gazar",
            "gazed",
            "gazes",
            "gazon",
            "gazoo",
            "geals",
            "geans",
            "geare",
            "gears",
            "geats",
            "gebur",
            "gecks",
            "geeks",
            "geeps",
            "geest",
            "geist",
            "geits",
            "gelds",
            "gelee",
            "gelid",
            "gelly",
            "gelts",
            "gemel",
            "gemma",
            "gemmy",
            "gemot",
            "genal",
            "genas",
            "genes",
            "genet",
            "genic",
            "genii",
            "genip",
            "genny",
            "genoa",
            "genom",
            "genro",
            "gents",
            "genty",
            "genua",
            "genus",
            "geode",
            "geoid",
            "gerah",
            "gerbe",
            "geres",
            "gerle",
            "germs",
            "germy",
            "gerne",
            "gesse",
            "gesso",
            "geste",
            "gests",
            "getas",
            "getup",
            "geums",
            "geyan",
            "geyer",
            "ghast",
            "ghats",
            "ghaut",
            "ghazi",
            "ghees",
            "ghest",
            "ghyll",
            "gibed",
            "gibel",
            "giber",
            "gibes",
            "gibli",
            "gibus",
            "gifts",
            "gigas",
            "gighe",
            "gigot",
            "gigue",
            "gilas",
            "gilds",
            "gilet",
            "gills",
            "gilly",
            "gilpy",
            "gilts",
            "gimel",
            "gimme",
            "gimps",
            "gimpy",
            "ginch",
            "ginge",
            "gings",
            "ginks",
            "ginny",
            "ginzo",
            "gipon",
            "gippo",
            "gippy",
            "girds",
            "girls",
            "girns",
            "giron",
            "giros",
            "girrs",
            "girsh",
            "girts",
            "gismo",
            "gisms",
            "gists",
            "gitch",
            "gites",
            "giust",
            "gived",
            "gives",
            "gizmo",
            "glace",
            "glads",
            "glady",
            "glaik",
            "glair",
            "glams",
            "glans",
            "glary",
            "glaum",
            "glaur",
            "glazy",
            "gleba",
            "glebe",
            "gleby",
            "glede",
            "gleds",
            "gleed",
            "gleek",
            "glees",
            "gleet",
            "gleis",
            "glens",
            "glent",
            "gleys",
            "glial",
            "glias",
            "glibs",
            "gliff",
            "glift",
            "glike",
            "glime",
            "glims",
            "glisk",
            "glits",
            "glitz",
            "gloam",
            "globi",
            "globs",
            "globy",
            "glode",
            "glogg",
            "gloms",
            "gloop",
            "glops",
            "glost",
            "glout",
            "glows",
            "gloze",
            "glued",
            "gluer",
            "glues",
            "gluey",
            "glugs",
            "glume",
            "glums",
            "gluon",
            "glute",
            "gluts",
            "gnarl",
            "gnarr",
            "gnars",
            "gnats",
            "gnawn",
            "gnaws",
            "gnows",
            "goads",
            "goafs",
            "goals",
            "goary",
            "goats",
            "goaty",
            "goban",
            "gobar",
            "gobbi",
            "gobbo",
            "gobby",
            "gobis",
            "gobos",
            "godet",
            "godso",
            "goels",
            "goers",
            "goest",
            "goeth",
            "goety",
            "gofer",
            "goffs",
            "gogga",
            "gogos",
            "goier",
            "gojis",
            "golds",
            "goldy",
            "goles",
            "golfs",
            "golpe",
            "golps",
            "gombo",
            "gomer",
            "gompa",
            "gonch",
            "gonef",
            "gongs",
            "gonia",
            "gonif",
            "gonks",
            "gonna",
            "gonof",
            "gonys",
            "gonzo",
            "gooby",
            "goods",
            "goofs",
            "googs",
            "gooks",
            "gooky",
            "goold",
            "gools",
            "gooly",
            "goons",
            "goony",
            "goops",
            "goopy",
            "goors",
            "goory",
            "goosy",
            "gopak",
            "gopik",
            "goral",
            "goras",
            "gored",
            "gores",
            "goris",
            "gorms",
            "gormy",
            "gorps",
            "gorse",
            "gorsy",
            "gosht",
            "gosse",
            "gotch",
            "goths",
            "gothy",
            "gotta",
            "gouch",
            "gouks",
            "goura",
            "gouts",
            "gouty",
            "gowan",
            "gowds",
            "gowfs",
            "gowks",
            "gowls",
            "gowns",
            "goxes",
            "goyim",
            "goyle",
            "graal",
            "grabs",
            "grads",
            "graff",
            "graip",
            "grama",
            "grame",
            "gramp",
            "grams",
            "grana",
            "grans",
            "grapy",
            "gravs",
            "grays",
            "grebe",
            "grebo",
            "grece",
            "greek",
            "grees",
            "grege",
            "grego",
            "grein",
            "grens",
            "grese",
            "greve",
            "grews",
            "greys",
            "grice",
            "gride",
            "grids",
            "griff",
            "grift",
            "grigs",
            "grike",
            "grins",
            "griot",
            "grips",
            "gript",
            "gripy",
            "grise",
            "grist",
            "grisy",
            "grith",
            "grits",
            "grize",
            "groat",
            "grody",
            "grogs",
            "groks",
            "groma",
            "grone",
            "groof",
            "grosz",
            "grots",
            "grouf",
            "grovy",
            "grows",
            "grrls",
            "grrrl",
            "grubs",
            "grued",
            "grues",
            "grufe",
            "grume",
            "grump",
            "grund",
            "gryce",
            "gryde",
            "gryke",
            "grype",
            "grypt",
            "guaco",
            "guana",
            "guano",
            "guans",
            "guars",
            "gucks",
            "gucky",
            "gudes",
            "guffs",
            "gugas",
            "guids",
            "guimp",
            "guiro",
            "gulag",
            "gular",
            "gulas",
            "gules",
            "gulet",
            "gulfs",
            "gulfy",
            "gulls",
            "gulph",
            "gulps",
            "gulpy",
            "gumma",
            "gummi",
            "gumps",
            "gundy",
            "gunge",
            "gungy",
            "gunks",
            "gunky",
            "gunny",
            "guqin",
            "gurdy",
            "gurge",
            "gurls",
            "gurly",
            "gurns",
            "gurry",
            "gursh",
            "gurus",
            "gushy",
            "gusla",
            "gusle",
            "gusli",
            "gussy",
            "gusts",
            "gutsy",
            "gutta",
            "gutty",
            "guyed",
            "guyle",
            "guyot",
            "guyse",
            "gwine",
            "gyals",
            "gyans",
            "gybed",
            "gybes",
            "gyeld",
            "gymps",
            "gynae",
            "gynie",
            "gynny",
            "gynos",
            "gyoza",
            "gypos",
            "gyppo",
            "gyppy",
            "gyral",
            "gyred",
            "gyres",
            "gyron",
            "gyros",
            "gyrus",
            "gytes",
            "gyved",
            "gyves",
            "haafs",
            "haars",
            "hable",
            "habus",
            "hacek",
            "hacks",
            "hadal",
            "haded",
            "hades",
            "hadji",
            "hadst",
            "haems",
            "haets",
            "haffs",
            "hafiz",
            "hafts",
            "haggs",
            "hahas",
            "haick",
            "haika",
            "haiks",
            "haiku",
            "hails",
            "haily",
            "hains",
            "haint",
            "hairs",
            "haith",
            "hajes",
            "hajis",
            "hajji",
            "hakam",
            "hakas",
            "hakea",
            "hakes",
            "hakim",
            "hakus",
            "halal",
            "haled",
            "haler",
            "hales",
            "halfa",
            "halfs",
            "halid",
            "hallo",
            "halls",
            "halma",
            "halms",
            "halon",
            "halos",
            "halse",
            "halts",
            "halva",
            "halwa",
            "hamal",
            "hamba",
            "hamed",
            "hames",
            "hammy",
            "hamza",
            "hanap",
            "hance",
            "hanch",
            "hands",
            "hangi",
            "hangs",
            "hanks",
            "hanky",
            "hansa",
            "hanse",
            "hants",
            "haole",
            "haoma",
            "hapax",
            "haply",
            "happi",
            "hapus",
            "haram",
            "hards",
            "hared",
            "hares",
            "harim",
            "harks",
            "harls",
            "harms",
            "harns",
            "haros",
            "harps",
            "harts",
            "hashy",
            "hasks",
            "hasps",
            "hasta",
            "hated",
            "hates",
            "hatha",
            "hauds",
            "haufs",
            "haugh",
            "hauld",
            "haulm",
            "hauls",
            "hault",
            "hauns",
            "hause",
            "haver",
            "haves",
            "hawed",
            "hawks",
            "hawms",
            "hawse",
            "hayed",
            "hayer",
            "hayey",
            "hayle",
            "hazan",
            "hazed",
            "hazer",
            "hazes",
            "heads",
            "heald",
            "heals",
            "heame",
            "heaps",
            "heapy",
            "heare",
            "hears",
            "heast",
            "heats",
            "heben",
            "hebes",
            "hecht",
            "hecks",
            "heder",
            "hedgy",
            "heeds",
            "heedy",
            "heels",
            "heeze",
            "hefte",
            "hefts",
            "heids",
            "heigh",
            "heils",
            "heirs",
            "hejab",
            "hejra",
            "heled",
            "heles",
            "helio",
            "hells",
            "helms",
            "helos",
            "helot",
            "helps",
            "helve",
            "hemal",
            "hemes",
            "hemic",
            "hemin",
            "hemps",
            "hempy",
            "hench",
            "hends",
            "henge",
            "henna",
            "henny",
            "henry",
            "hents",
            "hepar",
            "herbs",
            "herby",
            "herds",
            "heres",
            "herls",
            "herma",
            "herms",
            "herns",
            "heros",
            "herry",
            "herse",
            "hertz",
            "herye",
            "hesps",
            "hests",
            "hetes",
            "heths",
            "heuch",
            "heugh",
            "hevea",
            "hewed",
            "hewer",
            "hewgh",
            "hexad",
            "hexed",
            "hexer",
            "hexes",
            "hexyl",
            "heyed",
            "hiant",
            "hicks",
            "hided",
            "hider",
            "hides",
            "hiems",
            "highs",
            "hight",
            "hijab",
            "hijra",
            "hiked",
            "hiker",
            "hikes",
            "hikoi",
            "hilar",
            "hilch",
            "hillo",
            "hills",
            "hilts",
            "hilum",
            "hilus",
            "himbo",
            "hinau",
            "hinds",
            "hings",
            "hinky",
            "hinny",
            "hints",
            "hiois",
            "hiply",
            "hired",
            "hiree",
            "hirer",
            "hires",
            "hissy",
            "hists",
            "hithe",
            "hived",
            "hiver",
            "hives",
            "hizen",
            "hoaed",
            "hoagy",
            "hoars",
            "hoary",
            "hoast",
            "hobos",
            "hocks",
            "hocus",
            "hodad",
            "hodja",
            "hoers",
            "hogan",
            "hogen",
            "hoggs",
            "hoghs",
            "hohed",
            "hoick",
            "hoied",
            "hoiks",
            "hoing",
            "hoise",
            "hokas",
            "hoked",
            "hokes",
            "hokey",
            "hokis",
            "hokku",
            "hokum",
            "holds",
            "holed",
            "holes",
            "holey",
            "holks",
            "holla",
            "hollo",
            "holme",
            "holms",
            "holon",
            "holos",
            "holts",
            "homas",
            "homed",
            "homes",
            "homey",
            "homie",
            "homme",
            "homos",
            "honan",
            "honda",
            "honds",
            "honed",
            "honer",
            "hones",
            "hongi",
            "hongs",
            "honks",
            "honky",
            "hooch",
            "hoods",
            "hoody",
            "hooey",
            "hoofs",
            "hooka",
            "hooks",
            "hooky",
            "hooly",
            "hoons",
            "hoops",
            "hoord",
            "hoors",
            "hoosh",
            "hoots",
            "hooty",
            "hoove",
            "hopak",
            "hoped",
            "hoper",
            "hopes",
            "hoppy",
            "horah",
            "horal",
            "horas",
            "horis",
            "horks",
            "horme",
            "horns",
            "horst",
            "horsy",
            "hosed",
            "hosel",
            "hosen",
            "hoser",
            "hoses",
            "hosey",
            "hosta",
            "hosts",
            "hotch",
            "hoten",
            "hotty",
            "houff",
            "houfs",
            "hough",
            "houri",
            "hours",
            "houts",
            "hovea",
            "hoved",
            "hoven",
            "hoves",
            "howbe",
            "howes",
            "howff",
            "howfs",
            "howks",
            "howls",
            "howre",
            "howso",
            "hoxed",
            "hoxes",
            "hoyas",
            "hoyed",
            "hoyle",
            "hubby",
            "hucks",
            "hudna",
            "hudud",
            "huers",
            "huffs",
            "huffy",
            "huger",
            "huggy",
            "huhus",
            "huias",
            "hulas",
            "hules",
            "hulks",
            "hulky",
            "hullo",
            "hulls",
            "hully",
            "humas",
            "humfs",
            "humic",
            "humps",
            "humpy",
            "hunks",
            "hunts",
            "hurds",
            "hurls",
            "hurly",
            "hurra",
            "hurst",
            "hurts",
            "hushy",
            "husks",
            "husos",
            "hutia",
            "huzza",
            "huzzy",
            "hwyls",
            "hydra",
            "hyens",
            "hygge",
            "hying",
            "hykes",
            "hylas",
            "hyleg",
            "hyles",
            "hylic",
            "hymns",
            "hynde",
            "hyoid",
            "hyped",
            "hypes",
            "hypha",
            "hyphy",
            "hypos",
            "hyrax",
            "hyson",
            "hythe",
            "iambi",
            "iambs",
            "ibrik",
            "icers",
            "iched",
            "iches",
            "ichor",
            "icier",
            "icker",
            "ickle",
            "icons",
            "ictal",
            "ictic",
            "ictus",
            "idant",
            "ideas",
            "idees",
            "ident",
            "idled",
            "idles",
            "idola",
            "idols",
            "idyls",
            "iftar",
            "igapo",
            "igged",
            "iglus",
            "ihram",
            "ikans",
            "ikats",
            "ikons",
            "ileac",
            "ileal",
            "ileum",
            "ileus",
            "iliad",
            "ilial",
            "ilium",
            "iller",
            "illth",
            "imago",
            "imams",
            "imari",
            "imaum",
            "imbar",
            "imbed",
            "imide",
            "imido",
            "imids",
            "imine",
            "imino",
            "immew",
            "immit",
            "immix",
            "imped",
            "impis",
            "impot",
            "impro",
            "imshi",
            "imshy",
            "inapt",
            "inarm",
            "inbye",
            "incel",
            "incle",
            "incog",
            "incus",
            "incut",
            "indew",
            "india",
            "indie",
            "indol",
            "indow",
            "indri",
            "indue",
            "inerm",
            "infix",
            "infos",
            "infra",
            "ingan",
            "ingle",
            "inion",
            "inked",
            "inker",
            "inkle",
            "inned",
            "innit",
            "inorb",
            "inrun",
            "inset",
            "inspo",
            "intel",
            "intil",
            "intis",
            "intra",
            "inula",
            "inure",
            "inurn",
            "inust",
            "invar",
            "inwit",
            "iodic",
            "iodid",
            "iodin",
            "iotas",
            "ippon",
            "irade",
            "irids",
            "iring",
            "irked",
            "iroko",
            "irone",
            "irons",
            "isbas",
            "ishes",
            "isled",
            "isles",
            "isnae",
            "issei",
            "istle",
            "items",
            "ither",
            "ivied",
            "ivies",
            "ixias",
            "ixnay",
            "ixora",
            "ixtle",
            "izard",
            "izars",
            "izzat",
            "jaaps",
            "jabot",
            "jacal",
            "jacks",
            "jacky",
            "jaded",
            "jades",
            "jafas",
            "jaffa",
            "jagas",
            "jager",
            "jaggs",
            "jaggy",
            "jagir",
            "jagra",
            "jails",
            "jaker",
            "jakes",
            "jakey",
            "jalap",
            "jalop",
            "jambe",
            "jambo",
            "jambs",
            "jambu",
            "james",
            "jammy",
            "jamon",
            "janes",
            "janns",
            "janny",
            "janty",
            "japan",
            "japed",
            "japer",
            "japes",
            "jarks",
            "jarls",
            "jarps",
            "jarta",
            "jarul",
            "jasey",
            "jaspe",
            "jasps",
            "jatos",
            "jauks",
            "jaups",
            "javas",
            "javel",
            "jawan",
            "jawed",
            "jaxie",
            "jeans",
            "jeats",
            "jebel",
            "jedis",
            "jeels",
            "jeely",
            "jeeps",
            "jeers",
            "jeeze",
            "jefes",
            "jeffs",
            "jehad",
            "jehus",
            "jelab",
            "jello",
            "jells",
            "jembe",
            "jemmy",
            "jenny",
            "jeons",
            "jerid",
            "jerks",
            "jerry",
            "jesse",
            "jests",
            "jesus",
            "jetes",
            "jeton",
            "jeune",
            "jewed",
            "jewie",
            "jhala",
            "jiaos",
            "jibba",
            "jibbs",
            "jibed",
            "jiber",
            "jibes",
            "jiffs",
            "jiggy",
            "jigot",
            "jihad",
            "jills",
            "jilts",
            "jimmy",
            "jimpy",
            "jingo",
            "jinks",
            "jinne",
            "jinni",
            "jinns",
            "jirds",
            "jirga",
            "jirre",
            "jisms",
            "jived",
            "jiver",
            "jives",
            "jivey",
            "jnana",
            "jobed",
            "jobes",
            "jocko",
            "jocks",
            "jocky",
            "jocos",
            "jodel",
            "joeys",
            "johns",
            "joins",
            "joked",
            "jokes",
            "jokey",
            "jokol",
            "joled",
            "joles",
            "jolls",
            "jolts",
            "jolty",
            "jomon",
            "jomos",
            "jones",
            "jongs",
            "jonty",
            "jooks",
            "joram",
            "jorum",
            "jotas",
            "jotty",
            "jotun",
            "joual",
            "jougs",
            "jouks",
            "joule",
            "jours",
            "jowar",
            "jowed",
            "jowls",
            "jowly",
            "joyed",
            "jubas",
            "jubes",
            "jucos",
            "judas",
            "judgy",
            "judos",
            "jugal",
            "jugum",
            "jujus",
            "juked",
            "jukes",
            "jukus",
            "julep",
            "jumar",
            "jumby",
            "jumps",
            "junco",
            "junks",
            "junky",
            "jupes",
            "jupon",
            "jural",
            "jurat",
            "jurel",
            "jures",
            "justs",
            "jutes",
            "jutty",
            "juves",
            "juvie",
            "kaama",
            "kabab",
            "kabar",
            "kabob",
            "kacha",
            "kacks",
            "kadai",
            "kades",
            "kadis",
            "kafir",
            "kagos",
            "kagus",
            "kahal",
            "kaiak",
            "kaids",
            "kaies",
            "kaifs",
            "kaika",
            "kaiks",
            "kails",
            "kaims",
            "kaing",
            "kains",
            "kakas",
            "kakis",
            "kalam",
            "kales",
            "kalif",
            "kalis",
            "kalpa",
            "kamas",
            "kames",
            "kamik",
            "kamis",
            "kamme",
            "kanae",
            "kanas",
            "kandy",
            "kaneh",
            "kanes",
            "kanga",
            "kangs",
            "kanji",
            "kants",
            "kanzu",
            "kaons",
            "kapas",
            "kaphs",
            "kapok",
            "kapow",
            "kapus",
            "kaput",
            "karas",
            "karat",
            "karks",
            "karns",
            "karoo",
            "karos",
            "karri",
            "karst",
            "karsy",
            "karts",
            "karzy",
            "kasha",
            "kasme",
            "katal",
            "katas",
            "katis",
            "katti",
            "kaugh",
            "kauri",
            "kauru",
            "kaury",
            "kaval",
            "kavas",
            "kawas",
            "kawau",
            "kawed",
            "kayle",
            "kayos",
            "kazis",
            "kazoo",
            "kbars",
            "kebar",
            "kebob",
            "kecks",
            "kedge",
            "kedgy",
            "keech",
            "keefs",
            "keeks",
            "keels",
            "keema",
            "keeno",
            "keens",
            "keeps",
            "keets",
            "keeve",
            "kefir",
            "kehua",
            "keirs",
            "kelep",
            "kelim",
            "kells",
            "kelly",
            "kelps",
            "kelpy",
            "kelts",
            "kelty",
            "kembo",
            "kembs",
            "kemps",
            "kempt",
            "kempy",
            "kenaf",
            "kench",
            "kendo",
            "kenos",
            "kente",
            "kents",
            "kepis",
            "kerbs",
            "kerel",
            "kerfs",
            "kerky",
            "kerma",
            "kerne",
            "kerns",
            "keros",
            "kerry",
            "kerve",
            "kesar",
            "kests",
            "ketas",
            "ketch",
            "ketes",
            "ketol",
            "kevel",
            "kevil",
            "kexes",
            "keyed",
            "keyer",
            "khadi",
            "khafs",
            "khans",
            "khaph",
            "khats",
            "khaya",
            "khazi",
            "kheda",
            "kheth",
            "khets",
            "khoja",
            "khors",
            "khoum",
            "khuds",
            "kiaat",
            "kiack",
            "kiang",
            "kibbe",
            "kibbi",
            "kibei",
            "kibes",
            "kibla",
            "kicks",
            "kicky",
            "kiddo",
            "kiddy",
            "kidel",
            "kidge",
            "kiefs",
            "kiers",
            "kieve",
            "kievs",
            "kight",
            "kikes",
            "kikoi",
            "kiley",
            "kilim",
            "kills",
            "kilns",
            "kilos",
            "kilps",
            "kilts",
            "kilty",
            "kimbo",
            "kinas",
            "kinda",
            "kinds",
            "kindy",
            "kines",
            "kings",
            "kinin",
            "kinks",
            "kinos",
            "kiore",
            "kipes",
            "kippa",
            "kipps",
            "kirby",
            "kirks",
            "kirns",
            "kirri",
            "kisan",
            "kissy",
            "kists",
            "kited",
            "kiter",
            "kites",
            "kithe",
            "kiths",
            "kitul",
            "kivas",
            "kiwis",
            "klang",
            "klaps",
            "klett",
            "klick",
            "klieg",
            "kliks",
            "klong",
            "kloof",
            "kluge",
            "klutz",
            "knags",
            "knaps",
            "knarl",
            "knars",
            "knaur",
            "knawe",
            "knees",
            "knell",
            "knish",
            "knits",
            "knive",
            "knobs",
            "knops",
            "knosp",
            "knots",
            "knout",
            "knowe",
            "knows",
            "knubs",
            "knurl",
            "knurr",
            "knurs",
            "knuts",
            "koans",
            "koaps",
            "koban",
            "kobos",
            "koels",
            "koffs",
            "kofta",
            "kogal",
            "kohas",
            "kohen",
            "kohls",
            "koine",
            "kojis",
            "kokam",
            "kokas",
            "koker",
            "kokra",
            "kokum",
            "kolas",
            "kolos",
            "kombu",
            "konbu",
            "kondo",
            "konks",
            "kooks",
            "kooky",
            "koori",
            "kopek",
            "kophs",
            "kopje",
            "koppa",
            "korai",
            "koras",
            "korat",
            "kores",
            "korma",
            "koros",
            "korun",
            "korus",
            "koses",
            "kotch",
            "kotos",
            "kotow",
            "koura",
            "kraal",
            "krabs",
            "kraft",
            "krais",
            "krait",
            "krang",
            "krans",
            "kranz",
            "kraut",
            "krays",
            "kreep",
            "kreng",
            "krewe",
            "krona",
            "krone",
            "kroon",
            "krubi",
            "krunk",
            "ksars",
            "kubie",
            "kudos",
            "kudus",
            "kudzu",
            "kufis",
            "kugel",
            "kuias",
            "kukri",
            "kukus",
            "kulak",
            "kulan",
            "kulas",
            "kulfi",
            "kumis",
            "kumys",
            "kuris",
            "kurre",
            "kurta",
            "kurus",
            "kusso",
            "kutas",
            "kutch",
            "kutis",
            "kutus",
            "kuzus",
            "kvass",
            "kvell",
            "kwela",
            "kyack",
            "kyaks",
            "kyang",
            "kyars",
            "kyats",
            "kybos",
            "kydst",
            "kyles",
            "kylie",
            "kylin",
            "kylix",
            "kyloe",
            "kynde",
            "kynds",
            "kypes",
            "kyrie",
            "kytes",
            "kythe",
            "laari",
            "labda",
            "labia",
            "labis",
            "labra",
            "laced",
            "lacer",
            "laces",
            "lacet",
            "lacey",
            "lacks",
            "laddy",
            "laded",
            "lader",
            "lades",
            "laers",
            "laevo",
            "lagan",
            "lahal",
            "lahar",
            "laich",
            "laics",
            "laids",
            "laigh",
            "laika",
            "laiks",
            "laird",
            "lairs",
            "lairy",
            "laith",
            "laity",
            "laked",
            "laker",
            "lakes",
            "lakhs",
            "lakin",
            "laksa",
            "laldy",
            "lalls",
            "lamas",
            "lambs",
            "lamby",
            "lamed",
            "lamer",
            "lames",
            "lamia",
            "lammy",
            "lamps",
            "lanai",
            "lanas",
            "lanch",
            "lande",
            "lands",
            "lanes",
            "lanks",
            "lants",
            "lapin",
            "lapis",
            "lapje",
            "larch",
            "lards",
            "lardy",
            "laree",
            "lares",
            "largo",
            "laris",
            "larks",
            "larky",
            "larns",
            "larnt",
            "larum",
            "lased",
            "laser",
            "lases",
            "lassi",
            "lassu",
            "lassy",
            "lasts",
            "latah",
            "lated",
            "laten",
            "latex",
            "lathi",
            "laths",
            "lathy",
            "latke",
            "latus",
            "lauan",
            "lauch",
            "lauds",
            "laufs",
            "laund",
            "laura",
            "laval",
            "lavas",
            "laved",
            "laver",
            "laves",
            "lavra",
            "lavvy",
            "lawed",
            "lawer",
            "lawin",
            "lawks",
            "lawns",
            "lawny",
            "laxed",
            "laxer",
            "laxes",
            "laxly",
            "layed",
            "layin",
            "layup",
            "lazar",
            "lazed",
            "lazes",
            "lazos",
            "lazzi",
            "lazzo",
            "leads",
            "leady",
            "leafs",
            "leaks",
            "leams",
            "leans",
            "leany",
            "leaps",
            "leare",
            "lears",
            "leary",
            "leats",
            "leavy",
            "leaze",
            "leben",
            "leccy",
            "ledes",
            "ledgy",
            "ledum",
            "leear",
            "leeks",
            "leeps",
            "leers",
            "leese",
            "leets",
            "leeze",
            "lefte",
            "lefts",
            "leger",
            "leges",
            "legge",
            "leggo",
            "legit",
            "lehrs",
            "lehua",
            "leirs",
            "leish",
            "leman",
            "lemed",
            "lemel",
            "lemes",
            "lemma",
            "lemme",
            "lends",
            "lenes",
            "lengs",
            "lenis",
            "lenos",
            "lense",
            "lenti",
            "lento",
            "leone",
            "lepid",
            "lepra",
            "lepta",
            "lered",
            "leres",
            "lerps",
            "lesbo",
            "leses",
            "lests",
            "letch",
            "lethe",
            "letup",
            "leuch",
            "leuco",
            "leuds",
            "leugh",
            "levas",
            "levee",
            "leves",
            "levin",
            "levis",
            "lewis",
            "lexes",
            "lexis",
            "lezes",
            "lezza",
            "lezzy",
            "liana",
            "liane",
            "liang",
            "liard",
            "liars",
            "liart",
            "liber",
            "libra",
            "libri",
            "lichi",
            "licht",
            "licit",
            "licks",
            "lidar",
            "lidos",
            "liefs",
            "liens",
            "liers",
            "lieus",
            "lieve",
            "lifer",
            "lifes",
            "lifts",
            "ligan",
            "liger",
            "ligge",
            "ligne",
            "liked",
            "liker",
            "likes",
            "likin",
            "lills",
            "lilos",
            "lilts",
            "liman",
            "limas",
            "limax",
            "limba",
            "limbi",
            "limbs",
            "limby",
            "limed",
            "limen",
            "limes",
            "limey",
            "limma",
            "limns",
            "limos",
            "limpa",
            "limps",
            "linac",
            "linch",
            "linds",
            "lindy",
            "lined",
            "lines",
            "liney",
            "linga",
            "lings",
            "lingy",
            "linin",
            "links",
            "linky",
            "linns",
            "linny",
            "linos",
            "lints",
            "linty",
            "linum",
            "linux",
            "lions",
            "lipas",
            "lipes",
            "lipin",
            "lipos",
            "lippy",
            "liras",
            "lirks",
            "lirot",
            "lisks",
            "lisle",
            "lisps",
            "lists",
            "litai",
            "litas",
            "lited",
            "liter",
            "lites",
            "litho",
            "liths",
            "litre",
            "lived",
            "liven",
            "lives",
            "livor",
            "livre",
            "llano",
            "loach",
            "loads",
            "loafs",
            "loams",
            "loans",
            "loast",
            "loave",
            "lobar",
            "lobed",
            "lobes",
            "lobos",
            "lobus",
            "loche",
            "lochs",
            "locie",
            "locis",
            "locks",
            "locos",
            "locum",
            "loden",
            "lodes",
            "loess",
            "lofts",
            "logan",
            "loges",
            "loggy",
            "logia",
            "logie",
            "logoi",
            "logon",
            "logos",
            "lohan",
            "loids",
            "loins",
            "loipe",
            "loirs",
            "lokes",
            "lolls",
            "lolly",
            "lolog",
            "lomas",
            "lomed",
            "lomes",
            "loner",
            "longa",
            "longe",
            "longs",
            "looby",
            "looed",
            "looey",
            "loofa",
            "loofs",
            "looie",
            "looks",
            "looky",
            "looms",
            "loons",
            "loony",
            "loops",
            "loord",
            "loots",
            "loped",
            "loper",
            "lopes",
            "loppy",
            "loral",
            "loran",
            "lords",
            "lordy",
            "lorel",
            "lores",
            "loric",
            "loris",
            "losed",
            "losel",
            "losen",
            "loses",
            "lossy",
            "lotah",
            "lotas",
            "lotes",
            "lotic",
            "lotos",
            "lotsa",
            "lotta",
            "lotte",
            "lotto",
            "lotus",
            "loued",
            "lough",
            "louie",
            "louis",
            "louma",
            "lound",
            "louns",
            "loupe",
            "loups",
            "loure",
            "lours",
            "loury",
            "louts",
            "lovat",
            "loved",
            "loves",
            "lovey",
            "lovie",
            "lowan",
            "lowed",
            "lowes",
            "lownd",
            "lowne",
            "lowns",
            "lowps",
            "lowry",
            "lowse",
            "lowts",
            "loxed",
            "loxes",
            "lozen",
            "luach",
            "luaus",
            "lubed",
            "lubes",
            "lubra",
            "luces",
            "lucks",
            "lucre",
            "ludes",
            "ludic",
            "ludos",
            "luffa",
            "luffs",
            "luged",
            "luger",
            "luges",
            "lulls",
            "lulus",
            "lumas",
            "lumbi",
            "lumme",
            "lummy",
            "lumps",
            "lunas",
            "lunes",
            "lunet",
            "lungi",
            "lungs",
            "lunks",
            "lunts",
            "lupin",
            "lured",
            "lurer",
            "lures",
            "lurex",
            "lurgi",
            "lurgy",
            "lurks",
            "lurry",
            "lurve",
            "luser",
            "lushy",
            "lusks",
            "lusts",
            "lusus",
            "lutea",
            "luted",
            "luter",
            "lutes",
            "luvvy",
            "luxed",
            "luxer",
            "luxes",
            "lweis",
            "lyams",
            "lyard",
            "lyart",
            "lyase",
            "lycea",
            "lycee",
            "lycra",
            "lymes",
            "lynes",
            "lyres",
            "lysed",
            "lyses",
            "lysin",
            "lysis",
            "lysol",
            "lyssa",
            "lyted",
            "lytes",
            "lythe",
            "lytic",
            "lytta",
            "maaed",
            "maare",
            "maars",
            "mabes",
            "macas",
            "maced",
            "macer",
            "maces",
            "mache",
            "machi",
            "machs",
            "macks",
            "macle",
            "macon",
            "madge",
            "madid",
            "madre",
            "maerl",
            "mafic",
            "mages",
            "maggs",
            "magot",
            "magus",
            "mahoe",
            "mahua",
            "mahwa",
            "maids",
            "maiko",
            "maiks",
            "maile",
            "maill",
            "mails",
            "maims",
            "mains",
            "maire",
            "mairs",
            "maise",
            "maist",
            "makar",
            "makes",
            "makis",
            "makos",
            "malam",
            "malar",
            "malas",
            "malax",
            "males",
            "malic",
            "malik",
            "malis",
            "malls",
            "malms",
            "malmy",
            "malts",
            "malty",
            "malus",
            "malva",
            "malwa",
            "mamas",
            "mamba",
            "mamee",
            "mamey",
            "mamie",
            "manas",
            "manat",
            "mandi",
            "maneb",
            "maned",
            "maneh",
            "manes",
            "manet",
            "mangs",
            "manis",
            "manky",
            "manna",
            "manos",
            "manse",
            "manta",
            "manto",
            "manty",
            "manul",
            "manus",
            "mapau",
            "maqui",
            "marae",
            "marah",
            "maras",
            "marcs",
            "mardy",
            "mares",
            "marge",
            "margs",
            "maria",
            "marid",
            "marka",
            "marks",
            "marle",
            "marls",
            "marly",
            "marms",
            "maron",
            "maror",
            "marra",
            "marri",
            "marse",
            "marts",
            "marvy",
            "masas",
            "mased",
            "maser",
            "mases",
            "mashy",
            "masks",
            "massa",
            "massy",
            "masts",
            "masty",
            "masus",
            "matai",
            "mated",
            "mater",
            "mates",
            "maths",
            "matin",
            "matlo",
            "matte",
            "matts",
            "matza",
            "matzo",
            "mauby",
            "mauds",
            "mauls",
            "maund",
            "mauri",
            "mausy",
            "mauts",
            "mauzy",
            "maven",
            "mavie",
            "mavin",
            "mavis",
            "mawed",
            "mawks",
            "mawky",
            "mawns",
            "mawrs",
            "maxed",
            "maxes",
            "maxis",
            "mayan",
            "mayas",
            "mayed",
            "mayos",
            "mayst",
            "mazed",
            "mazer",
            "mazes",
            "mazey",
            "mazut",
            "mbira",
            "meads",
            "meals",
            "meane",
            "means",
            "meany",
            "meare",
            "mease",
            "meath",
            "meats",
            "mebos",
            "mechs",
            "mecks",
            "medii",
            "medle",
            "meeds",
            "meers",
            "meets",
            "meffs",
            "meins",
            "meint",
            "meiny",
            "meith",
            "mekka",
            "melas",
            "melba",
            "melds",
            "melic",
            "melik",
            "mells",
            "melts",
            "melty",
            "memes",
            "memos",
            "menad",
            "mends",
            "mened",
            "menes",
            "menge",
            "mengs",
            "mensa",
            "mense",
            "mensh",
            "menta",
            "mento",
            "menus",
            "meous",
            "meows",
            "merch",
            "mercs",
            "merde",
            "mered",
            "merel",
            "merer",
            "meres",
            "meril",
            "meris",
            "merks",
            "merle",
            "merls",
            "merse",
            "mesal",
            "mesas",
            "mesel",
            "meses",
            "meshy",
            "mesic",
            "mesne",
            "meson",
            "messy",
            "mesto",
            "meted",
            "metes",
            "metho",
            "meths",
            "metic",
            "metif",
            "metis",
            "metol",
            "metre",
            "meuse",
            "meved",
            "meves",
            "mewed",
            "mewls",
            "meynt",
            "mezes",
            "mezze",
            "mezzo",
            "mhorr",
            "miaou",
            "miaow",
            "miasm",
            "miaul",
            "micas",
            "miche",
            "micht",
            "micks",
            "micky",
            "micos",
            "micra",
            "middy",
            "midgy",
            "midis",
            "miens",
            "mieve",
            "miffs",
            "miffy",
            "mifty",
            "miggs",
            "mihas",
            "mihis",
            "miked",
            "mikes",
            "mikra",
            "mikva",
            "milch",
            "milds",
            "miler",
            "miles",
            "milfs",
            "milia",
            "milko",
            "milks",
            "mille",
            "mills",
            "milor",
            "milos",
            "milpa",
            "milts",
            "milty",
            "miltz",
            "mimed",
            "mimeo",
            "mimer",
            "mimes",
            "mimsy",
            "minae",
            "minar",
            "minas",
            "mincy",
            "minds",
            "mined",
            "mines",
            "minge",
            "mings",
            "mingy",
            "minis",
            "minke",
            "minks",
            "minny",
            "minos",
            "mints",
            "mired",
            "mires",
            "mirex",
            "mirid",
            "mirin",
            "mirks",
            "mirky",
            "mirly",
            "miros",
            "mirvs",
            "mirza",
            "misch",
            "misdo",
            "mises",
            "misgo",
            "misos",
            "missa",
            "mists",
            "misty",
            "mitch",
            "miter",
            "mites",
            "mitis",
            "mitre",
            "mitts",
            "mixed",
            "mixen",
            "mixer",
            "mixes",
            "mixte",
            "mixup",
            "mizen",
            "mizzy",
            "mneme",
            "moans",
            "moats",
            "mobby",
            "mobes",
            "mobey",
            "mobie",
            "moble",
            "mochi",
            "mochs",
            "mochy",
            "mocks",
            "moder",
            "modes",
            "modge",
            "modii",
            "modus",
            "moers",
            "mofos",
            "moggy",
            "mohel",
            "mohos",
            "mohrs",
            "mohua",
            "mohur",
            "moile",
            "moils",
            "moira",
            "moire",
            "moits",
            "mojos",
            "mokes",
            "mokis",
            "mokos",
            "molal",
            "molas",
            "molds",
            "moled",
            "moles",
            "molla",
            "molls",
            "molly",
            "molto",
            "molts",
            "molys",
            "momes",
            "momma",
            "mommy",
            "momus",
            "monad",
            "monal",
            "monas",
            "monde",
            "mondo",
            "moner",
            "mongo",
            "mongs",
            "monic",
            "monie",
            "monks",
            "monos",
            "monte",
            "monty",
            "moobs",
            "mooch",
            "moods",
            "mooed",
            "mooks",
            "moola",
            "mooli",
            "mools",
            "mooly",
            "moong",
            "moons",
            "moony",
            "moops",
            "moors",
            "moory",
            "moots",
            "moove",
            "moped",
            "moper",
            "mopes",
            "mopey",
            "moppy",
            "mopsy",
            "mopus",
            "morae",
            "moras",
            "morat",
            "moray",
            "morel",
            "mores",
            "moria",
            "morne",
            "morns",
            "morra",
            "morro",
            "morse",
            "morts",
            "mosed",
            "moses",
            "mosey",
            "mosks",
            "mosso",
            "moste",
            "mosts",
            "moted",
            "moten",
            "motes",
            "motet",
            "motey",
            "moths",
            "mothy",
            "motis",
            "motte",
            "motts",
            "motty",
            "motus",
            "motza",
            "mouch",
            "moues",
            "mould",
            "mouls",
            "moups",
            "moust",
            "mousy",
            "moved",
            "moves",
            "mowas",
            "mowed",
            "mowra",
            "moxas",
            "moxie",
            "moyas",
            "moyle",
            "moyls",
            "mozed",
            "mozes",
            "mozos",
            "mpret",
            "mucho",
            "mucic",
            "mucid",
            "mucin",
            "mucks",
            "mucor",
            "mucro",
            "mudge",
            "mudir",
            "mudra",
            "muffs",
            "mufti",
            "mugga",
            "muggs",
            "muggy",
            "muhly",
            "muids",
            "muils",
            "muirs",
            "muist",
            "mujik",
            "mulct",
            "muled",
            "mules",
            "muley",
            "mulga",
            "mulie",
            "mulla",
            "mulls",
            "mulse",
            "mulsh",
            "mumms",
            "mumps",
            "mumsy",
            "mumus",
            "munga",
            "munge",
            "mungo",
            "mungs",
            "munis",
            "munts",
            "muntu",
            "muons",
            "muras",
            "mured",
            "mures",
            "murex",
            "murid",
            "murks",
            "murls",
            "murly",
            "murra",
            "murre",
            "murri",
            "murrs",
            "murry",
            "murti",
            "murva",
            "musar",
            "musca",
            "mused",
            "muser",
            "muses",
            "muset",
            "musha",
            "musit",
            "musks",
            "musos",
            "musse",
            "mussy",
            "musth",
            "musts",
            "mutch",
            "muted",
            "muter",
            "mutes",
            "mutha",
            "mutis",
            "muton",
            "mutts",
            "muxed",
            "muxes",
            "muzak",
            "muzzy",
            "mvule",
            "myall",
            "mylar",
            "mynah",
            "mynas",
            "myoid",
            "myoma",
            "myope",
            "myops",
            "myopy",
            "mysid",
            "mythi",
            "myths",
            "mythy",
            "myxos",
            "mzees",
            "naams",
            "naans",
            "nabes",
            "nabis",
            "nabks",
            "nabla",
            "nabob",
            "nache",
            "nacho",
            "nacre",
            "nadas",
            "naeve",
            "naevi",
            "naffs",
            "nagas",
            "naggy",
            "nagor",
            "nahal",
            "naiad",
            "naifs",
            "naiks",
            "nails",
            "naira",
            "nairu",
            "naked",
            "naker",
            "nakfa",
            "nalas",
            "naled",
            "nalla",
            "named",
            "namer",
            "names",
            "namma",
            "namus",
            "nanas",
            "nance",
            "nancy",
            "nandu",
            "nanna",
            "nanos",
            "nanua",
            "napas",
            "naped",
            "napes",
            "napoo",
            "nappa",
            "nappe",
            "nappy",
            "naras",
            "narco",
            "narcs",
            "nards",
            "nares",
            "naric",
            "naris",
            "narks",
            "narky",
            "narre",
            "nashi",
            "natch",
            "nates",
            "natis",
            "natty",
            "nauch",
            "naunt",
            "navar",
            "naves",
            "navew",
            "navvy",
            "nawab",
            "nazes",
            "nazir",
            "nazis",
            "nduja",
            "neafe",
            "neals",
            "neaps",
            "nears",
            "neath",
            "neats",
            "nebek",
            "nebel",
            "necks",
            "neddy",
            "needs",
            "neeld",
            "neele",
            "neemb",
            "neems",
            "neeps",
            "neese",
            "neeze",
            "negro",
            "negus",
            "neifs",
            "neist",
            "neive",
            "nelis",
            "nelly",
            "nemas",
            "nemns",
            "nempt",
            "nenes",
            "neons",
            "neper",
            "nepit",
            "neral",
            "nerds",
            "nerka",
            "nerks",
            "nerol",
            "nerts",
            "nertz",
            "nervy",
            "nests",
            "netes",
            "netop",
            "netts",
            "netty",
            "neuks",
            "neume",
            "neums",
            "nevel",
            "neves",
            "nevus",
            "newbs",
            "newed",
            "newel",
            "newie",
            "newsy",
            "newts",
            "nexts",
            "nexus",
            "ngaio",
            "ngana",
            "ngati",
            "ngoma",
            "ngwee",
            "nicad",
            "nicht",
            "nicks",
            "nicol",
            "nidal",
            "nided",
            "nides",
            "nidor",
            "nidus",
            "niefs",
            "nieve",
            "nifes",
            "niffs",
            "niffy",
            "nifty",
            "niger",
            "nighs",
            "nihil",
            "nikab",
            "nikah",
            "nikau",
            "nills",
            "nimbi",
            "nimbs",
            "nimps",
            "niner",
            "nines",
            "ninon",
            "nipas",
            "nippy",
            "niqab",
            "nirls",
            "nirly",
            "nisei",
            "nisse",
            "nisus",
            "niter",
            "nites",
            "nitid",
            "niton",
            "nitre",
            "nitro",
            "nitry",
            "nitty",
            "nival",
            "nixed",
            "nixer",
            "nixes",
            "nixie",
            "nizam",
            "nkosi",
            "noahs",
            "nobby",
            "nocks",
            "nodal",
            "noddy",
            "nodes",
            "nodus",
            "noels",
            "noggs",
            "nohow",
            "noils",
            "noily",
            "noint",
            "noirs",
            "noles",
            "nolls",
            "nolos",
            "nomas",
            "nomen",
            "nomes",
            "nomic",
            "nomoi",
            "nomos",
            "nonas",
            "nonce",
            "nones",
            "nonet",
            "nongs",
            "nonis",
            "nonny",
            "nonyl",
            "noobs",
            "nooit",
            "nooks",
            "nooky",
            "noons",
            "noops",
            "nopal",
            "noria",
            "noris",
            "norks",
            "norma",
            "norms",
            "nosed",
            "noser",
            "noses",
            "notal",
            "noted",
            "noter",
            "notes",
            "notum",
            "nould",
            "noule",
            "nouls",
            "nouns",
            "nouny",
            "noups",
            "novae",
            "novas",
            "novum",
            "noway",
            "nowed",
            "nowls",
            "nowts",
            "nowty",
            "noxal",
            "noxes",
            "noyau",
            "noyed",
            "noyes",
            "nubby",
            "nubia",
            "nucha",
            "nuddy",
            "nuder",
            "nudes",
            "nudie",
            "nudzh",
            "nuffs",
            "nugae",
            "nuked",
            "nukes",
            "nulla",
            "nulls",
            "numbs",
            "numen",
            "nummy",
            "nunny",
            "nurds",
            "nurdy",
            "nurls",
            "nurrs",
            "nutso",
            "nutsy",
            "nyaff",
            "nyala",
            "nying",
            "nyssa",
            "oaked",
            "oaker",
            "oakum",
            "oared",
            "oases",
            "oasis",
            "oasts",
            "oaten",
            "oater",
            "oaths",
            "oaves",
            "obang",
            "obeah",
            "obeli",
            "obeys",
            "obias",
            "obied",
            "obiit",
            "obits",
            "objet",
            "oboes",
            "obole",
            "oboli",
            "obols",
            "occam",
            "ocher",
            "oches",
            "ochre",
            "ochry",
            "ocker",
            "ocrea",
            "octad",
            "octan",
            "octas",
            "octyl",
            "oculi",
            "odahs",
            "odals",
            "odeon",
            "odeum",
            "odism",
            "odist",
            "odium",
            "odors",
            "odour",
            "odyle",
            "odyls",
            "ofays",
            "offed",
            "offie",
            "oflag",
            "ofter",
            "ogams",
            "ogeed",
            "ogees",
            "oggin",
            "ogham",
            "ogive",
            "ogled",
            "ogler",
            "ogles",
            "ogmic",
            "ogres",
            "ohias",
            "ohing",
            "ohmic",
            "ohone",
            "oidia",
            "oiled",
            "oiler",
            "oinks",
            "oints",
            "ojime",
            "okapi",
            "okays",
            "okehs",
            "okras",
            "oktas",
            "oldie",
            "oleic",
            "olein",
            "olent",
            "oleos",
            "oleum",
            "olios",
            "ollas",
            "ollav",
            "oller",
            "ollie",
            "ology",
            "olpae",
            "olpes",
            "omasa",
            "omber",
            "ombus",
            "omens",
            "omers",
            "omits",
            "omlah",
            "omovs",
            "omrah",
            "oncer",
            "onces",
            "oncet",
            "oncus",
            "onely",
            "oners",
            "onery",
            "onium",
            "onkus",
            "onlay",
            "onned",
            "ontic",
            "oobit",
            "oohed",
            "oomph",
            "oonts",
            "ooped",
            "oorie",
            "ooses",
            "ootid",
            "oozed",
            "oozes",
            "opahs",
            "opals",
            "opens",
            "opepe",
            "oping",
            "oppos",
            "opsin",
            "opted",
            "opter",
            "orach",
            "oracy",
            "orals",
            "orang",
            "orant",
            "orate",
            "orbed",
            "orcas",
            "orcin",
            "ordos",
            "oread",
            "orfes",
            "orgia",
            "orgic",
            "orgue",
            "oribi",
            "oriel",
            "orixa",
            "orles",
            "orlon",
            "orlop",
            "ormer",
            "ornis",
            "orpin",
            "orris",
            "ortho",
            "orval",
            "orzos",
            "oscar",
            "oshac",
            "osier",
            "osmic",
            "osmol",
            "ossia",
            "ostia",
            "otaku",
            "otary",
            "ottar",
            "ottos",
            "oubit",
            "oucht",
            "ouens",
            "ouija",
            "oulks",
            "oumas",
            "oundy",
            "oupas",
            "ouped",
            "ouphe",
            "ouphs",
            "ourie",
            "ousel",
            "ousts",
            "outby",
            "outed",
            "outre",
            "outro",
            "outta",
            "ouzel",
            "ouzos",
            "ovals",
            "ovels",
            "ovens",
            "overs",
            "ovist",
            "ovoli",
            "ovolo",
            "ovule",
            "owche",
            "owies",
            "owled",
            "owler",
            "owlet",
            "owned",
            "owres",
            "owrie",
            "owsen",
            "oxbow",
            "oxers",
            "oxeye",
            "oxids",
            "oxies",
            "oxime",
            "oxims",
            "oxlip",
            "oxter",
            "oyers",
            "ozeki",
            "ozzie",
            "paals",
            "paans",
            "pacas",
            "paced",
            "pacer",
            "paces",
            "pacey",
            "pacha",
            "packs",
            "pacos",
            "pacta",
            "pacts",
            "padis",
            "padle",
            "padma",
            "padre",
            "padri",
            "paean",
            "paedo",
            "paeon",
            "paged",
            "pager",
            "pages",
            "pagle",
            "pagod",
            "pagri",
            "paiks",
            "pails",
            "pains",
            "paire",
            "pairs",
            "paisa",
            "paise",
            "pakka",
            "palas",
            "palay",
            "palea",
            "paled",
            "pales",
            "palet",
            "palis",
            "palki",
            "palla",
            "palls",
            "pally",
            "palms",
            "palmy",
            "palpi",
            "palps",
            "palsa",
            "pampa",
            "panax",
            "pance",
            "panda",
            "pands",
            "pandy",
            "paned",
            "panes",
            "panga",
            "pangs",
            "panim",
            "panko",
            "panne",
            "panni",
            "panto",
            "pants",
            "panty",
            "paoli",
            "paolo",
            "papas",
            "papaw",
            "papes",
            "pappi",
            "pappy",
            "parae",
            "paras",
            "parch",
            "pardi",
            "pards",
            "pardy",
            "pared",
            "paren",
            "pareo",
            "pares",
            "pareu",
            "parev",
            "parge",
            "pargo",
            "paris",
            "parki",
            "parks",
            "parky",
            "parle",
            "parly",
            "parma",
            "parol",
            "parps",
            "parra",
            "parrs",
            "parti",
            "parts",
            "parve",
            "parvo",
            "paseo",
            "pases",
            "pasha",
            "pashm",
            "paska",
            "paspy",
            "passe",
            "pasts",
            "pated",
            "paten",
            "pater",
            "pates",
            "paths",
            "patin",
            "patka",
            "patly",
            "patte",
            "patus",
            "pauas",
            "pauls",
            "pavan",
            "paved",
            "paven",
            "paver",
            "paves",
            "pavid",
            "pavin",
            "pavis",
            "pawas",
            "pawaw",
            "pawed",
            "pawer",
            "pawks",
            "pawky",
            "pawls",
            "pawns",
            "paxes",
            "payed",
            "payor",
            "paysd",
            "peage",
            "peags",
            "peaks",
            "peaky",
            "peals",
            "peans",
            "peare",
            "pears",
            "peart",
            "pease",
            "peats",
            "peaty",
            "peavy",
            "peaze",
            "pebas",
            "pechs",
            "pecke",
            "pecks",
            "pecky",
            "pedes",
            "pedis",
            "pedro",
            "peece",
            "peeks",
            "peels",
            "peens",
            "peeoy",
            "peepe",
            "peeps",
            "peers",
            "peery",
            "peeve",
            "peggy",
            "peghs",
            "peins",
            "peise",
            "peize",
            "pekan",
            "pekes",
            "pekin",
            "pekoe",
            "pelas",
            "pelau",
            "peles",
            "pelfs",
            "pells",
            "pelma",
            "pelon",
            "pelta",
            "pelts",
            "pends",
            "pendu",
            "pened",
            "penes",
            "pengo",
            "penie",
            "penis",
            "penks",
            "penna",
            "penni",
            "pents",
            "peons",
            "peony",
            "pepla",
            "pepos",
            "peppy",
            "pepsi",
            "perai",
            "perce",
            "percs",
            "perdu",
            "perdy",
            "perea",
            "peres",
            "peris",
            "perks",
            "perms",
            "perns",
            "perog",
            "perps",
            "perry",
            "perse",
            "perst",
            "perts",
            "perve",
            "pervo",
            "pervs",
            "pervy",
            "pesos",
            "pests",
            "pesty",
            "petar",
            "peter",
            "petit",
            "petre",
            "petri",
            "petti",
            "petto",
            "pewee",
            "pewit",
            "peyse",
            "phage",
            "phang",
            "phare",
            "pharm",
            "pheer",
            "phene",
            "pheon",
            "phese",
            "phial",
            "phish",
            "phizz",
            "phlox",
            "phoca",
            "phono",
            "phons",
            "phots",
            "phpht",
            "phuts",
            "phyla",
            "phyle",
            "piani",
            "pians",
            "pibal",
            "pical",
            "picas",
            "piccy",
            "picks",
            "picot",
            "picra",
            "picul",
            "piend",
            "piers",
            "piert",
            "pieta",
            "piets",
            "piezo",
            "pight",
            "pigmy",
            "piing",
            "pikas",
            "pikau",
            "piked",
            "piker",
            "pikes",
            "pikey",
            "pikis",
            "pikul",
            "pilae",
            "pilaf",
            "pilao",
            "pilar",
            "pilau",
            "pilaw",
            "pilch",
            "pilea",
            "piled",
            "pilei",
            "piler",
            "piles",
            "pilis",
            "pills",
            "pilow",
            "pilum",
            "pilus",
            "pimas",
            "pimps",
            "pinas",
            "pined",
            "pines",
            "pingo",
            "pings",
            "pinko",
            "pinks",
            "pinna",
            "pinny",
            "pinon",
            "pinot",
            "pinta",
            "pints",
            "pinup",
            "pions",
            "piony",
            "pious",
            "pioye",
            "pioys",
            "pipal",
            "pipas",
            "piped",
            "pipes",
            "pipet",
            "pipis",
            "pipit",
            "pippy",
            "pipul",
            "pirai",
            "pirls",
            "pirns",
            "pirog",
            "pisco",
            "pises",
            "pisky",
            "pisos",
            "pissy",
            "piste",
            "pitas",
            "piths",
            "piton",
            "pitot",
            "pitta",
            "piums",
            "pixes",
            "pized",
            "pizes",
            "plaas",
            "plack",
            "plage",
            "plans",
            "plaps",
            "plash",
            "plasm",
            "plast",
            "plats",
            "platt",
            "platy",
            "playa",
            "plays",
            "pleas",
            "plebe",
            "plebs",
            "plena",
            "pleon",
            "plesh",
            "plews",
            "plica",
            "plies",
            "plims",
            "pling",
            "plink",
            "ploat",
            "plods",
            "plong",
            "plonk",
            "plook",
            "plops",
            "plots",
            "plotz",
            "plouk",
            "plows",
            "ploye",
            "ploys",
            "plues",
            "pluff",
            "plugs",
            "plums",
            "plumy",
            "pluot",
            "pluto",
            "plyer",
            "poach",
            "poaka",
            "poake",
            "poboy",
            "pocks",
            "pocky",
            "podal",
            "poddy",
            "podex",
            "podge",
            "podgy",
            "podia",
            "poems",
            "poeps",
            "poets",
            "pogey",
            "pogge",
            "pogos",
            "pohed",
            "poilu",
            "poind",
            "pokal",
            "poked",
            "pokes",
            "pokey",
            "pokie",
            "poled",
            "poler",
            "poles",
            "poley",
            "polio",
            "polis",
            "polje",
            "polks",
            "polls",
            "polly",
            "polos",
            "polts",
            "polys",
            "pombe",
            "pomes",
            "pommy",
            "pomos",
            "pomps",
            "ponce",
            "poncy",
            "ponds",
            "pones",
            "poney",
            "ponga",
            "pongo",
            "pongs",
            "pongy",
            "ponks",
            "ponts",
            "ponty",
            "ponzu",
            "poods",
            "pooed",
            "poofs",
            "poofy",
            "poohs",
            "pooja",
            "pooka",
            "pooks",
            "pools",
            "poons",
            "poops",
            "poopy",
            "poori",
            "poort",
            "poots",
            "poove",
            "poovy",
            "popes",
            "poppa",
            "popsy",
            "porae",
            "poral",
            "pored",
            "porer",
            "pores",
            "porge",
            "porgy",
            "porin",
            "porks",
            "porky",
            "porno",
            "porns",
            "porny",
            "porta",
            "ports",
            "porty",
            "posed",
            "poses",
            "posey",
            "posho",
            "posts",
            "potae",
            "potch",
            "poted",
            "potes",
            "potin",
            "potoo",
            "potsy",
            "potto",
            "potts",
            "potty",
            "pouff",
            "poufs",
            "pouke",
            "pouks",
            "poule",
            "poulp",
            "poult",
            "poupe",
            "poupt",
            "pours",
            "pouts",
            "powan",
            "powin",
            "pownd",
            "powns",
            "powny",
            "powre",
            "poxed",
            "poxes",
            "poynt",
            "poyou",
            "poyse",
            "pozzy",
            "praam",
            "prads",
            "prahu",
            "prams",
            "prana",
            "prang",
            "praos",
            "prase",
            "prate",
            "prats",
            "pratt",
            "praty",
            "praus",
            "prays",
            "predy",
            "preed",
            "prees",
            "preif",
            "prems",
            "premy",
            "prent",
            "preon",
            "preop",
            "preps",
            "presa",
            "prese",
            "prest",
            "preve",
            "prexy",
            "preys",
            "prial",
            "pricy",
            "prief",
            "prier",
            "pries",
            "prigs",
            "prill",
            "prima",
            "primi",
            "primp",
            "prims",
            "primy",
            "prink",
            "prion",
            "prise",
            "priss",
            "proas",
            "probs",
            "prods",
            "proem",
            "profs",
            "progs",
            "proin",
            "proke",
            "prole",
            "proll",
            "promo",
            "proms",
            "pronk",
            "props",
            "prore",
            "proso",
            "pross",
            "prost",
            "prosy",
            "proto",
            "proul",
            "prows",
            "proyn",
            "prunt",
            "pruta",
            "pryer",
            "pryse",
            "pseud",
            "pshaw",
            "psion",
            "psoae",
            "psoai",
            "psoas",
            "psora",
            "psych",
            "psyop",
            "pubco",
            "pubes",
            "pubis",
            "pucan",
            "pucer",
            "puces",
            "pucka",
            "pucks",
            "puddy",
            "pudge",
            "pudic",
            "pudor",
            "pudsy",
            "pudus",
            "puers",
            "puffa",
            "puffs",
            "puggy",
            "pugil",
            "puhas",
            "pujah",
            "pujas",
            "pukas",
            "puked",
            "puker",
            "pukes",
            "pukey",
            "pukka",
            "pukus",
            "pulao",
            "pulas",
            "puled",
            "puler",
            "pules",
            "pulik",
            "pulis",
            "pulka",
            "pulks",
            "pulli",
            "pulls",
            "pully",
            "pulmo",
            "pulps",
            "pulus",
            "pumas",
            "pumie",
            "pumps",
            "punas",
            "punce",
            "punga",
            "pungs",
            "punji",
            "punka",
            "punks",
            "punky",
            "punny",
            "punto",
            "punts",
            "punty",
            "pupae",
            "pupas",
            "pupus",
            "purda",
            "pured",
            "pures",
            "purin",
            "puris",
            "purls",
            "purpy",
            "purrs",
            "pursy",
            "purty",
            "puses",
            "pusle",
            "pussy",
            "putid",
            "puton",
            "putti",
            "putto",
            "putts",
            "puzel",
            "pwned",
            "pyats",
            "pyets",
            "pygal",
            "pyins",
            "pylon",
            "pyned",
            "pynes",
            "pyoid",
            "pyots",
            "pyral",
            "pyran",
            "pyres",
            "pyrex",
            "pyric",
            "pyros",
            "pyxed",
            "pyxes",
            "pyxie",
            "pyxis",
            "pzazz",
            "qadis",
            "qaids",
            "qajaq",
            "qanat",
            "qapik",
            "qibla",
            "qophs",
            "qorma",
            "quads",
            "quaff",
            "quags",
            "quair",
            "quais",
            "quaky",
            "quale",
            "quant",
            "quare",
            "quass",
            "quate",
            "quats",
            "quayd",
            "quays",
            "qubit",
            "quean",
            "queme",
            "quena",
            "quern",
            "queyn",
            "queys",
            "quich",
            "quids",
            "quiff",
            "quims",
            "quina",
            "quine",
            "quino",
            "quins",
            "quint",
            "quipo",
            "quips",
            "quipu",
            "quire",
            "quirt",
            "quist",
            "quits",
            "quoad",
            "quods",
            "quoif",
            "quoin",
            "quoit",
            "quoll",
            "quonk",
            "quops",
            "qursh",
            "quyte",
            "rabat",
            "rabic",
            "rabis",
            "raced",
            "races",
            "rache",
            "racks",
            "racon",
            "radge",
            "radix",
            "radon",
            "raffs",
            "rafts",
            "ragas",
            "ragde",
            "raged",
            "ragee",
            "rager",
            "rages",
            "ragga",
            "raggs",
            "raggy",
            "ragis",
            "ragus",
            "rahed",
            "rahui",
            "raias",
            "raids",
            "raiks",
            "raile",
            "rails",
            "raine",
            "rains",
            "raird",
            "raita",
            "raits",
            "rajas",
            "rajes",
            "raked",
            "rakee",
            "raker",
            "rakes",
            "rakia",
            "rakis",
            "rakus",
            "rales",
            "ramal",
            "ramee",
            "ramet",
            "ramie",
            "ramin",
            "ramis",
            "rammy",
            "ramps",
            "ramus",
            "ranas",
            "rance",
            "rands",
            "ranee",
            "ranga",
            "rangi",
            "rangs",
            "rangy",
            "ranid",
            "ranis",
            "ranke",
            "ranks",
            "rants",
            "raped",
            "raper",
            "rapes",
            "raphe",
            "rappe",
            "rared",
            "raree",
            "rares",
            "rarks",
            "rased",
            "raser",
            "rases",
            "rasps",
            "rasse",
            "rasta",
            "ratal",
            "ratan",
            "ratas",
            "ratch",
            "rated",
            "ratel",
            "rater",
            "rates",
            "ratha",
            "rathe",
            "raths",
            "ratoo",
            "ratos",
            "ratus",
            "rauns",
            "raupo",
            "raved",
            "ravel",
            "raver",
            "raves",
            "ravey",
            "ravin",
            "rawer",
            "rawin",
            "rawly",
            "rawns",
            "raxed",
            "raxes",
            "rayah",
            "rayas",
            "rayed",
            "rayle",
            "rayne",
            "razed",
            "razee",
            "razer",
            "razes",
            "razoo",
            "readd",
            "reads",
            "reais",
            "reaks",
            "realo",
            "reals",
            "reame",
            "reams",
            "reamy",
            "reans",
            "reaps",
            "rears",
            "reast",
            "reata",
            "reate",
            "reave",
            "rebbe",
            "rebec",
            "rebid",
            "rebit",
            "rebop",
            "rebuy",
            "recal",
            "recce",
            "recco",
            "reccy",
            "recit",
            "recks",
            "recon",
            "recta",
            "recti",
            "recto",
            "redan",
            "redds",
            "reddy",
            "reded",
            "redes",
            "redia",
            "redid",
            "redip",
            "redly",
            "redon",
            "redos",
            "redox",
            "redry",
            "redub",
            "redux",
            "redye",
            "reech",
            "reede",
            "reeds",
            "reefs",
            "reefy",
            "reeks",
            "reeky",
            "reels",
            "reens",
            "reest",
            "reeve",
            "refed",
            "refel",
            "reffo",
            "refis",
            "refix",
            "refly",
            "refry",
            "regar",
            "reges",
            "reggo",
            "regie",
            "regma",
            "regna",
            "regos",
            "regur",
            "rehem",
            "reifs",
            "reify",
            "reiki",
            "reiks",
            "reink",
            "reins",
            "reird",
            "reist",
            "reive",
            "rejig",
            "rejon",
            "reked",
            "rekes",
            "rekey",
            "relet",
            "relie",
            "relit",
            "rello",
            "reman",
            "remap",
            "remen",
            "remet",
            "remex",
            "remix",
            "renay",
            "rends",
            "reney",
            "renga",
            "renig",
            "renin",
            "renne",
            "renos",
            "rente",
            "rents",
            "reoil",
            "reorg",
            "repeg",
            "repin",
            "repla",
            "repos",
            "repot",
            "repps",
            "repro",
            "reran",
            "rerig",
            "resat",
            "resaw",
            "resay",
            "resee",
            "reses",
            "resew",
            "resid",
            "resit",
            "resod",
            "resow",
            "resto",
            "rests",
            "resty",
            "resus",
            "retag",
            "retax",
            "retem",
            "retia",
            "retie",
            "retox",
            "revet",
            "revie",
            "rewan",
            "rewax",
            "rewed",
            "rewet",
            "rewin",
            "rewon",
            "rewth",
            "rexes",
            "rezes",
            "rheas",
            "rheme",
            "rheum",
            "rhies",
            "rhime",
            "rhine",
            "rhody",
            "rhomb",
            "rhone",
            "rhumb",
            "rhyne",
            "rhyta",
            "riads",
            "rials",
            "riant",
            "riata",
            "ribas",
            "ribby",
            "ribes",
            "riced",
            "ricer",
            "rices",
            "ricey",
            "richt",
            "ricin",
            "ricks",
            "rides",
            "ridgy",
            "ridic",
            "riels",
            "riems",
            "rieve",
            "rifer",
            "riffs",
            "rifte",
            "rifts",
            "rifty",
            "riggs",
            "rigol",
            "riled",
            "riles",
            "riley",
            "rille",
            "rills",
            "rimae",
            "rimed",
            "rimer",
            "rimes",
            "rimus",
            "rinds",
            "rindy",
            "rines",
            "rings",
            "rinks",
            "rioja",
            "riots",
            "riped",
            "ripes",
            "ripps",
            "rises",
            "rishi",
            "risks",
            "risps",
            "risus",
            "rites",
            "ritts",
            "ritzy",
            "rivas",
            "rived",
            "rivel",
            "riven",
            "rives",
            "riyal",
            "rizas",
            "roads",
            "roams",
            "roans",
            "roars",
            "roary",
            "roate",
            "robed",
            "robes",
            "roble",
            "rocks",
            "roded",
            "rodes",
            "roguy",
            "rohes",
            "roids",
            "roils",
            "roily",
            "roins",
            "roist",
            "rojak",
            "rojis",
            "roked",
            "roker",
            "rokes",
            "rolag",
            "roles",
            "rolfs",
            "rolls",
            "romal",
            "roman",
            "romeo",
            "romps",
            "ronde",
            "rondo",
            "roneo",
            "rones",
            "ronin",
            "ronne",
            "ronte",
            "ronts",
            "roods",
            "roofs",
            "roofy",
            "rooks",
            "rooky",
            "rooms",
            "roons",
            "roops",
            "roopy",
            "roosa",
            "roose",
            "roots",
            "rooty",
            "roped",
            "roper",
            "ropes",
            "ropey",
            "roque",
            "roral",
            "rores",
            "roric",
            "rorid",
            "rorie",
            "rorts",
            "rorty",
            "rosed",
            "roses",
            "roset",
            "roshi",
            "rosin",
            "rosit",
            "rosti",
            "rosts",
            "rotal",
            "rotan",
            "rotas",
            "rotch",
            "roted",
            "rotes",
            "rotis",
            "rotls",
            "roton",
            "rotos",
            "rotte",
            "rouen",
            "roues",
            "roule",
            "rouls",
            "roums",
            "roups",
            "roupy",
            "roust",
            "routh",
            "routs",
            "roved",
            "roven",
            "roves",
            "rowan",
            "rowed",
            "rowel",
            "rowen",
            "rowie",
            "rowme",
            "rownd",
            "rowth",
            "rowts",
            "royne",
            "royst",
            "rozet",
            "rozit",
            "ruana",
            "rubai",
            "rubby",
            "rubel",
            "rubes",
            "rubin",
            "ruble",
            "rubli",
            "rubus",
            "ruche",
            "rucks",
            "rudas",
            "rudds",
            "rudes",
            "rudie",
            "rudis",
            "rueda",
            "ruers",
            "ruffe",
            "ruffs",
            "rugae",
            "rugal",
            "ruggy",
            "ruing",
            "ruins",
            "rukhs",
            "ruled",
            "rules",
            "rumal",
            "rumbo",
            "rumen",
            "rumes",
            "rumly",
            "rummy",
            "rumpo",
            "rumps",
            "rumpy",
            "runch",
            "runds",
            "runed",
            "runes",
            "rungs",
            "runic",
            "runny",
            "runts",
            "runty",
            "rupia",
            "rurps",
            "rurus",
            "rusas",
            "ruses",
            "rushy",
            "rusks",
            "rusma",
            "russe",
            "rusts",
            "ruths",
            "rutin",
            "rutty",
            "ryals",
            "rybat",
            "ryked",
            "rykes",
            "rymme",
            "rynds",
            "ryots",
            "ryper",
            "saags",
            "sabal",
            "sabed",
            "saber",
            "sabes",
            "sabha",
            "sabin",
            "sabir",
            "sable",
            "sabot",
            "sabra",
            "sabre",
            "sacks",
            "sacra",
            "saddo",
            "sades",
            "sadhe",
            "sadhu",
            "sadis",
            "sados",
            "sadza",
            "safed",
            "safes",
            "sagas",
            "sager",
            "sages",
            "saggy",
            "sagos",
            "sagum",
            "saheb",
            "sahib",
            "saice",
            "saick",
            "saics",
            "saids",
            "saiga",
            "sails",
            "saims",
            "saine",
            "sains",
            "sairs",
            "saist",
            "saith",
            "sajou",
            "sakai",
            "saker",
            "sakes",
            "sakia",
            "sakis",
            "sakti",
            "salal",
            "salat",
            "salep",
            "sales",
            "salet",
            "salic",
            "salix",
            "salle",
            "salmi",
            "salol",
            "salop",
            "salpa",
            "salps",
            "salse",
            "salto",
            "salts",
            "salue",
            "salut",
            "saman",
            "samas",
            "samba",
            "sambo",
            "samek",
            "samel",
            "samen",
            "sames",
            "samey",
            "samfu",
            "sammy",
            "sampi",
            "samps",
            "sands",
            "saned",
            "sanes",
            "sanga",
            "sangh",
            "sango",
            "sangs",
            "sanko",
            "sansa",
            "santo",
            "sants",
            "saola",
            "sapan",
            "sapid",
            "sapor",
            "saran",
            "sards",
            "sared",
            "saree",
            "sarge",
            "sargo",
            "sarin",
            "saris",
            "sarks",
            "sarky",
            "sarod",
            "saros",
            "sarus",
            "saser",
            "sasin",
            "sasse",
            "satai",
            "satay",
            "sated",
            "satem",
            "sates",
            "satis",
            "sauba",
            "sauch",
            "saugh",
            "sauls",
            "sault",
            "saunt",
            "saury",
            "sauts",
            "saved",
            "saver",
            "saves",
            "savey",
            "savin",
            "sawah",
            "sawed",
            "sawer",
            "saxes",
            "sayed",
            "sayer",
            "sayid",
            "sayne",
            "sayon",
            "sayst",
            "sazes",
            "scabs",
            "scads",
            "scaff",
            "scags",
            "scail",
            "scala",
            "scall",
            "scams",
            "scand",
            "scans",
            "scapa",
            "scape",
            "scapi",
            "scarp",
            "scars",
            "scart",
            "scath",
            "scats",
            "scatt",
            "scaud",
            "scaup",
            "scaur",
            "scaws",
            "sceat",
            "scena",
            "scend",
            "schav",
            "schmo",
            "schul",
            "schwa",
            "sclim",
            "scody",
            "scogs",
            "scoog",
            "scoot",
            "scopa",
            "scops",
            "scots",
            "scoug",
            "scoup",
            "scowp",
            "scows",
            "scrab",
            "scrae",
            "scrag",
            "scran",
            "scrat",
            "scraw",
            "scray",
            "scrim",
            "scrip",
            "scrob",
            "scrod",
            "scrog",
            "scrow",
            "scudi",
            "scudo",
            "scuds",
            "scuff",
            "scuft",
            "scugs",
            "sculk",
            "scull",
            "sculp",
            "sculs",
            "scums",
            "scups",
            "scurf",
            "scurs",
            "scuse",
            "scuta",
            "scute",
            "scuts",
            "scuzz",
            "scyes",
            "sdayn",
            "sdein",
            "seals",
            "seame",
            "seams",
            "seamy",
            "seans",
            "seare",
            "sears",
            "sease",
            "seats",
            "seaze",
            "sebum",
            "secco",
            "sechs",
            "sects",
            "seder",
            "sedes",
            "sedge",
            "sedgy",
            "sedum",
            "seeds",
            "seeks",
            "seeld",
            "seels",
            "seely",
            "seems",
            "seeps",
            "seepy",
            "seers",
            "sefer",
            "segar",
            "segni",
            "segno",
            "segol",
            "segos",
            "sehri",
            "seifs",
            "seils",
            "seine",
            "seirs",
            "seise",
            "seism",
            "seity",
            "seiza",
            "sekos",
            "sekts",
            "selah",
            "seles",
            "selfs",
            "sella",
            "selle",
            "sells",
            "selva",
            "semee",
            "semes",
            "semie",
            "semis",
            "senas",
            "sends",
            "senes",
            "sengi",
            "senna",
            "senor",
            "sensa",
            "sensi",
            "sente",
            "senti",
            "sents",
            "senvy",
            "senza",
            "sepad",
            "sepal",
            "sepic",
            "sepoy",
            "septa",
            "septs",
            "serac",
            "serai",
            "seral",
            "sered",
            "serer",
            "seres",
            "serfs",
            "serge",
            "seric",
            "serin",
            "serks",
            "seron",
            "serow",
            "serra",
            "serre",
            "serrs",
            "serry",
            "servo",
            "sesey",
            "sessa",
            "setae",
            "setal",
            "seton",
            "setts",
            "sewan",
            "sewar",
            "sewed",
            "sewel",
            "sewen",
            "sewin",
            "sexed",
            "sexer",
            "sexes",
            "sexto",
            "sexts",
            "seyen",
            "shads",
            "shags",
            "shahs",
            "shako",
            "shakt",
            "shalm",
            "shaly",
            "shama",
            "shams",
            "shand",
            "shans",
            "shaps",
            "sharn",
            "shash",
            "shaul",
            "shawm",
            "shawn",
            "shaws",
            "shaya",
            "shays",
            "shchi",
            "sheaf",
            "sheal",
            "sheas",
            "sheds",
            "sheel",
            "shend",
            "shent",
            "sheol",
            "sherd",
            "shere",
            "shero",
            "shets",
            "sheva",
            "shewn",
            "shews",
            "shiai",
            "shiel",
            "shier",
            "shies",
            "shill",
            "shily",
            "shims",
            "shins",
            "ships",
            "shirr",
            "shirs",
            "shish",
            "shiso",
            "shist",
            "shite",
            "shits",
            "shiur",
            "shiva",
            "shive",
            "shivs",
            "shlep",
            "shlub",
            "shmek",
            "shmoe",
            "shoat",
            "shoed",
            "shoer",
            "shoes",
            "shogi",
            "shogs",
            "shoji",
            "shojo",
            "shola",
            "shool",
            "shoon",
            "shoos",
            "shope",
            "shops",
            "shorl",
            "shote",
            "shots",
            "shott",
            "showd",
            "shows",
            "shoyu",
            "shred",
            "shris",
            "shrow",
            "shtik",
            "shtum",
            "shtup",
            "shule",
            "shuln",
            "shuls",
            "shuns",
            "shura",
            "shute",
            "shuts",
            "shwas",
            "shyer",
            "sials",
            "sibbs",
            "sibyl",
            "sices",
            "sicht",
            "sicko",
            "sicks",
            "sicky",
            "sidas",
            "sided",
            "sider",
            "sides",
            "sidha",
            "sidhe",
            "sidle",
            "sield",
            "siens",
            "sient",
            "sieth",
            "sieur",
            "sifts",
            "sighs",
            "sigil",
            "sigla",
            "signa",
            "signs",
            "sijos",
            "sikas",
            "siker",
            "sikes",
            "silds",
            "siled",
            "silen",
            "siler",
            "siles",
            "silex",
            "silks",
            "sills",
            "silos",
            "silts",
            "silty",
            "silva",
            "simar",
            "simas",
            "simba",
            "simis",
            "simps",
            "simul",
            "sinds",
            "sined",
            "sines",
            "sings",
            "sinhs",
            "sinks",
            "sinky",
            "sinus",
            "siped",
            "sipes",
            "sippy",
            "sired",
            "siree",
            "sires",
            "sirih",
            "siris",
            "siroc",
            "sirra",
            "sirup",
            "sisal",
            "sises",
            "sista",
            "sists",
            "sitar",
            "sited",
            "sites",
            "sithe",
            "sitka",
            "situp",
            "situs",
            "siver",
            "sixer",
            "sixes",
            "sixmo",
            "sixte",
            "sizar",
            "sized",
            "sizel",
            "sizer",
            "sizes",
            "skags",
            "skail",
            "skald",
            "skank",
            "skart",
            "skats",
            "skatt",
            "skaws",
            "skean",
            "skear",
            "skeds",
            "skeed",
            "skeef",
            "skeen",
            "skeer",
            "skees",
            "skeet",
            "skegg",
            "skegs",
            "skein",
            "skelf",
            "skell",
            "skelm",
            "skelp",
            "skene",
            "skens",
            "skeos",
            "skeps",
            "skers",
            "skets",
            "skews",
            "skids",
            "skied",
            "skies",
            "skiey",
            "skimo",
            "skims",
            "skink",
            "skins",
            "skint",
            "skios",
            "skips",
            "skirl",
            "skirr",
            "skite",
            "skits",
            "skive",
            "skivy",
            "sklim",
            "skoal",
            "skody",
            "skoff",
            "skogs",
            "skols",
            "skool",
            "skort",
            "skosh",
            "skran",
            "skrik",
            "skuas",
            "skugs",
            "skyed",
            "skyer",
            "skyey",
            "skyfs",
            "skyre",
            "skyrs",
            "skyte",
            "slabs",
            "slade",
            "slaes",
            "slags",
            "slaid",
            "slake",
            "slams",
            "slane",
            "slank",
            "slaps",
            "slart",
            "slats",
            "slaty",
            "slaws",
            "slays",
            "slebs",
            "sleds",
            "sleer",
            "slews",
            "sleys",
            "slier",
            "slily",
            "slims",
            "slipe",
            "slips",
            "slipt",
            "slish",
            "slits",
            "slive",
            "sloan",
            "slobs",
            "sloes",
            "slogs",
            "sloid",
            "slojd",
            "slomo",
            "sloom",
            "sloot",
            "slops",
            "slopy",
            "slorm",
            "slots",
            "slove",
            "slows",
            "sloyd",
            "slubb",
            "slubs",
            "slued",
            "slues",
            "sluff",
            "slugs",
            "sluit",
            "slums",
            "slurb",
            "slurs",
            "sluse",
            "sluts",
            "slyer",
            "slype",
            "smaak",
            "smaik",
            "smalm",
            "smalt",
            "smarm",
            "smaze",
            "smeek",
            "smees",
            "smeik",
            "smeke",
            "smerk",
            "smews",
            "smirr",
            "smirs",
            "smits",
            "smogs",
            "smoko",
            "smolt",
            "smoor",
            "smoot",
            "smore",
            "smorg",
            "smout",
            "smowt",
            "smugs",
            "smurs",
            "smush",
            "smuts",
            "snabs",
            "snafu",
            "snags",
            "snaps",
            "snarf",
            "snark",
            "snars",
            "snary",
            "snash",
            "snath",
            "snaws",
            "snead",
            "sneap",
            "snebs",
            "sneck",
            "sneds",
            "sneed",
            "snees",
            "snell",
            "snibs",
            "snick",
            "snies",
            "snift",
            "snigs",
            "snips",
            "snipy",
            "snirt",
            "snits",
            "snobs",
            "snods",
            "snoek",
            "snoep",
            "snogs",
            "snoke",
            "snood",
            "snook",
            "snool",
            "snoot",
            "snots",
            "snowk",
            "snows",
            "snubs",
            "snugs",
            "snush",
            "snyes",
            "soaks",
            "soaps",
            "soare",
            "soars",
            "soave",
            "sobas",
            "socas",
            "soces",
            "socko",
            "socks",
            "socle",
            "sodas",
            "soddy",
            "sodic",
            "sodom",
            "sofar",
            "sofas",
            "softa",
            "softs",
            "softy",
            "soger",
            "sohur",
            "soils",
            "soily",
            "sojas",
            "sojus",
            "sokah",
            "soken",
            "sokes",
            "sokol",
            "solah",
            "solan",
            "solas",
            "solde",
            "soldi",
            "soldo",
            "solds",
            "soled",
            "solei",
            "soler",
            "soles",
            "solon",
            "solos",
            "solum",
            "solus",
            "soman",
            "somas",
            "sonce",
            "sonde",
            "sones",
            "songs",
            "sonly",
            "sonne",
            "sonny",
            "sonse",
            "sonsy",
            "sooey",
            "sooks",
            "sooky",
            "soole",
            "sools",
            "sooms",
            "soops",
            "soote",
            "soots",
            "sophs",
            "sophy",
            "sopor",
            "soppy",
            "sopra",
            "soral",
            "soras",
            "sorbo",
            "sorbs",
            "sorda",
            "sordo",
            "sords",
            "sored",
            "soree",
            "sorel",
            "sorer",
            "sores",
            "sorex",
            "sorgo",
            "sorns",
            "sorra",
            "sorta",
            "sorts",
            "sorus",
            "soths",
            "sotol",
            "souce",
            "souct",
            "sough",
            "souks",
            "souls",
            "soums",
            "soups",
            "soupy",
            "sours",
            "souse",
            "souts",
            "sowar",
            "sowce",
            "sowed",
            "sowff",
            "sowfs",
            "sowle",
            "sowls",
            "sowms",
            "sownd",
            "sowne",
            "sowps",
            "sowse",
            "sowth",
            "soyas",
            "soyle",
            "soyuz",
            "sozin",
            "spacy",
            "spado",
            "spaed",
            "spaer",
            "spaes",
            "spags",
            "spahi",
            "spail",
            "spain",
            "spait",
            "spake",
            "spald",
            "spale",
            "spall",
            "spalt",
            "spams",
            "spane",
            "spang",
            "spans",
            "spard",
            "spars",
            "spart",
            "spate",
            "spats",
            "spaul",
            "spawl",
            "spaws",
            "spayd",
            "spays",
            "spaza",
            "spazz",
            "speal",
            "spean",
            "speat",
            "specs",
            "spect",
            "speel",
            "speer",
            "speil",
            "speir",
            "speks",
            "speld",
            "spelk",
            "speos",
            "spets",
            "speug",
            "spews",
            "spewy",
            "spial",
            "spica",
            "spick",
            "spics",
            "spide",
            "spier",
            "spies",
            "spiff",
            "spifs",
            "spiks",
            "spile",
            "spims",
            "spina",
            "spink",
            "spins",
            "spirt",
            "spiry",
            "spits",
            "spitz",
            "spivs",
            "splay",
            "splog",
            "spode",
            "spods",
            "spoom",
            "spoor",
            "spoot",
            "spork",
            "sposh",
            "spots",
            "sprad",
            "sprag",
            "sprat",
            "spred",
            "sprew",
            "sprit",
            "sprod",
            "sprog",
            "sprue",
            "sprug",
            "spuds",
            "spued",
            "spuer",
            "spues",
            "spugs",
            "spule",
            "spume",
            "spumy",
            "spurs",
            "sputa",
            "spyal",
            "spyre",
            "squab",
            "squaw",
            "squeg",
            "squid",
            "squit",
            "squiz",
            "stabs",
            "stade",
            "stags",
            "stagy",
            "staig",
            "stane",
            "stang",
            "staph",
            "staps",
            "starn",
            "starr",
            "stars",
            "stats",
            "staun",
            "staws",
            "stays",
            "stean",
            "stear",
            "stedd",
            "stede",
            "steds",
            "steek",
            "steem",
            "steen",
            "steil",
            "stela",
            "stele",
            "stell",
            "steme",
            "stems",
            "stend",
            "steno",
            "stens",
            "stent",
            "steps",
            "stept",
            "stere",
            "stets",
            "stews",
            "stewy",
            "steys",
            "stich",
            "stied",
            "sties",
            "stilb",
            "stile",
            "stime",
            "stims",
            "stimy",
            "stipa",
            "stipe",
            "stire",
            "stirk",
            "stirp",
            "stirs",
            "stive",
            "stivy",
            "stoae",
            "stoai",
            "stoas",
            "stoat",
            "stobs",
            "stoep",
            "stogy",
            "stoit",
            "stoln",
            "stoma",
            "stond",
            "stong",
            "stonk",
            "stonn",
            "stook",
            "stoor",
            "stope",
            "stops",
            "stopt",
            "stoss",
            "stots",
            "stott",
            "stoun",
            "stoup",
            "stour",
            "stown",
            "stowp",
            "stows",
            "strad",
            "strae",
            "strag",
            "strak",
            "strep",
            "strew",
            "stria",
            "strig",
            "strim",
            "strop",
            "strow",
            "stroy",
            "strum",
            "stubs",
            "stude",
            "studs",
            "stull",
            "stulm",
            "stumm",
            "stums",
            "stuns",
            "stupa",
            "stupe",
            "sture",
            "sturt",
            "styed",
            "styes",
            "styli",
            "stylo",
            "styme",
            "stymy",
            "styre",
            "styte",
            "subah",
            "subas",
            "subby",
            "suber",
            "subha",
            "succi",
            "sucks",
            "sucky",
            "sucre",
            "sudds",
            "sudor",
            "sudsy",
            "suede",
            "suent",
            "suers",
            "suete",
            "suets",
            "suety",
            "sugan",
            "sughs",
            "sugos",
            "suhur",
            "suids",
            "suint",
            "suits",
            "sujee",
            "sukhs",
            "sukuk",
            "sulci",
            "sulfa",
            "sulfo",
            "sulks",
            "sulph",
            "sulus",
            "sumis",
            "summa",
            "sumos",
            "sumph",
            "sumps",
            "sunis",
            "sunks",
            "sunna",
            "sunns",
            "sunup",
            "supes",
            "supra",
            "surah",
            "sural",
            "suras",
            "surat",
            "surds",
            "sured",
            "sures",
            "surfs",
            "surfy",
            "surgy",
            "surra",
            "sused",
            "suses",
            "susus",
            "sutor",
            "sutra",
            "sutta",
            "swabs",
            "swack",
            "swads",
            "swage",
            "swags",
            "swail",
            "swain",
            "swale",
            "swaly",
            "swamy",
            "swang",
            "swank",
            "swans",
            "swaps",
            "swapt",
            "sward",
            "sware",
            "swarf",
            "swart",
            "swats",
            "swayl",
            "sways",
            "sweal",
            "swede",
            "sweed",
            "sweel",
            "sweer",
            "swees",
            "sweir",
            "swelt",
            "swerf",
            "sweys",
            "swies",
            "swigs",
            "swile",
            "swims",
            "swink",
            "swipe",
            "swire",
            "swiss",
            "swith",
            "swits",
            "swive",
            "swizz",
            "swobs",
            "swole",
            "swoln",
            "swops",
            "swopt",
            "swots",
            "swoun",
            "sybbe",
            "sybil",
            "syboe",
            "sybow",
            "sycee",
            "syces",
            "sycon",
            "syens",
            "syker",
            "sykes",
            "sylis",
            "sylph",
            "sylva",
            "symar",
            "synch",
            "syncs",
            "synds",
            "syned",
            "synes",
            "synth",
            "syped",
            "sypes",
            "syphs",
            "syrah",
            "syren",
            "sysop",
            "sythe",
            "syver",
            "taals",
            "taata",
            "taber",
            "tabes",
            "tabid",
            "tabis",
            "tabla",
            "tabor",
            "tabun",
            "tabus",
            "tacan",
            "taces",
            "tacet",
            "tache",
            "tacho",
            "tachs",
            "tacks",
            "tacos",
            "tacts",
            "taels",
            "tafia",
            "taggy",
            "tagma",
            "tahas",
            "tahrs",
            "taiga",
            "taigs",
            "taiko",
            "tails",
            "tains",
            "taira",
            "taish",
            "taits",
            "tajes",
            "takas",
            "takes",
            "takhi",
            "takin",
            "takis",
            "takky",
            "talak",
            "talaq",
            "talar",
            "talas",
            "talcs",
            "talcy",
            "talea",
            "taler",
            "tales",
            "talks",
            "talky",
            "talls",
            "talma",
            "talpa",
            "taluk",
            "talus",
            "tamal",
            "tamed",
            "tames",
            "tamin",
            "tamis",
            "tammy",
            "tamps",
            "tanas",
            "tanga",
            "tangi",
            "tangs",
            "tanhs",
            "tanka",
            "tanks",
            "tanky",
            "tanna",
            "tansy",
            "tanti",
            "tanto",
            "tanty",
            "tapas",
            "taped",
            "tapen",
            "tapes",
            "tapet",
            "tapis",
            "tappa",
            "tapus",
            "taras",
            "tardo",
            "tared",
            "tares",
            "targa",
            "targe",
            "tarns",
            "taroc",
            "tarok",
            "taros",
            "tarps",
            "tarre",
            "tarry",
            "tarsi",
            "tarts",
            "tarty",
            "tasar",
            "tased",
            "taser",
            "tases",
            "tasks",
            "tassa",
            "tasse",
            "tasso",
            "tatar",
            "tater",
            "tates",
            "taths",
            "tatie",
            "tatou",
            "tatts",
            "tatus",
            "taube",
            "tauld",
            "tauon",
            "taupe",
            "tauts",
            "tavah",
            "tavas",
            "taver",
            "tawai",
            "tawas",
            "tawed",
            "tawer",
            "tawie",
            "tawse",
            "tawts",
            "taxed",
            "taxer",
            "taxes",
            "taxis",
            "taxol",
            "taxon",
            "taxor",
            "taxus",
            "tayra",
            "tazza",
            "tazze",
            "teade",
            "teads",
            "teaed",
            "teaks",
            "teals",
            "teams",
            "tears",
            "teats",
            "teaze",
            "techs",
            "techy",
            "tecta",
            "teels",
            "teems",
            "teend",
            "teene",
            "teens",
            "teeny",
            "teers",
            "teffs",
            "teggs",
            "tegua",
            "tegus",
            "tehrs",
            "teiid",
            "teils",
            "teind",
            "teins",
            "telae",
            "telco",
            "teles",
            "telex",
            "telia",
            "telic",
            "tells",
            "telly",
            "teloi",
            "telos",
            "temed",
            "temes",
            "tempi",
            "temps",
            "tempt",
            "temse",
            "tench",
            "tends",
            "tendu",
            "tenes",
            "tenge",
            "tenia",
            "tenne",
            "tenno",
            "tenny",
            "tenon",
            "tents",
            "tenty",
            "tenue",
            "tepal",
            "tepas",
            "tepoy",
            "terai",
            "teras",
            "terce",
            "terek",
            "teres",
            "terfe",
            "terfs",
            "terga",
            "terms",
            "terne",
            "terns",
            "terry",
            "terts",
            "tesla",
            "testa",
            "teste",
            "tests",
            "tetes",
            "teths",
            "tetra",
            "tetri",
            "teuch",
            "teugh",
            "tewed",
            "tewel",
            "tewit",
            "texas",
            "texes",
            "texts",
            "thack",
            "thagi",
            "thaim",
            "thale",
            "thali",
            "thana",
            "thane",
            "thang",
            "thans",
            "thanx",
            "tharm",
            "thars",
            "thaws",
            "thawy",
            "thebe",
            "theca",
            "theed",
            "theek",
            "thees",
            "thegn",
            "theic",
            "thein",
            "thelf",
            "thema",
            "thens",
            "theow",
            "therm",
            "thesp",
            "thete",
            "thews",
            "thewy",
            "thigs",
            "thilk",
            "thill",
            "thine",
            "thins",
            "thiol",
            "thirl",
            "thoft",
            "thole",
            "tholi",
            "thoro",
            "thorp",
            "thous",
            "thowl",
            "thrae",
            "thraw",
            "thrid",
            "thrip",
            "throe",
            "thuds",
            "thugs",
            "thuja",
            "thunk",
            "thurl",
            "thuya",
            "thymi",
            "thymy",
            "tians",
            "tiars",
            "tical",
            "ticca",
            "ticed",
            "tices",
            "tichy",
            "ticks",
            "ticky",
            "tiddy",
            "tided",
            "tides",
            "tiers",
            "tiffs",
            "tifos",
            "tifts",
            "tiges",
            "tigon",
            "tikas",
            "tikes",
            "tikis",
            "tikka",
            "tilak",
            "tiled",
            "tiler",
            "tiles",
            "tills",
            "tilly",
            "tilth",
            "tilts",
            "timbo",
            "timed",
            "times",
            "timon",
            "timps",
            "tinas",
            "tinct",
            "tinds",
            "tinea",
            "tined",
            "tines",
            "tinge",
            "tings",
            "tinks",
            "tinny",
            "tints",
            "tinty",
            "tipis",
            "tippy",
            "tired",
            "tires",
            "tirls",
            "tiros",
            "tirrs",
            "titch",
            "titer",
            "titis",
            "titre",
            "titty",
            "titup",
            "tiyin",
            "tiyns",
            "tizes",
            "tizzy",
            "toads",
            "toady",
            "toaze",
            "tocks",
            "tocky",
            "tocos",
            "todde",
            "toeas",
            "toffs",
            "toffy",
            "tofts",
            "tofus",
            "togae",
            "togas",
            "toged",
            "toges",
            "togue",
            "tohos",
            "toile",
            "toils",
            "toing",
            "toise",
            "toits",
            "tokay",
            "toked",
            "toker",
            "tokes",
            "tokos",
            "tolan",
            "tolar",
            "tolas",
            "toled",
            "toles",
            "tolls",
            "tolly",
            "tolts",
            "tolus",
            "tolyl",
            "toman",
            "tombs",
            "tomes",
            "tomia",
            "tommy",
            "tomos",
            "tondi",
            "tondo",
            "toned",
            "toner",
            "tones",
            "toney",
            "tongs",
            "tonka",
            "tonks",
            "tonne",
            "tonus",
            "tools",
            "tooms",
            "toons",
            "toots",
            "toped",
            "topee",
            "topek",
            "toper",
            "topes",
            "tophe",
            "tophi",
            "tophs",
            "topis",
            "topoi",
            "topos",
            "toppy",
            "toque",
            "torah",
            "toran",
            "toras",
            "torcs",
            "tores",
            "toric",
            "torii",
            "toros",
            "torot",
            "torrs",
            "torse",
            "torsi",
            "torsk",
            "torta",
            "torte",
            "torts",
            "tosas",
            "tosed",
            "toses",
            "toshy",
            "tossy",
            "toted",
            "toter",
            "totes",
            "totty",
            "touks",
            "touns",
            "tours",
            "touse",
            "tousy",
            "touts",
            "touze",
            "touzy",
            "towed",
            "towie",
            "towns",
            "towny",
            "towse",
            "towsy",
            "towts",
            "towze",
            "towzy",
            "toyed",
            "toyer",
            "toyon",
            "toyos",
            "tozed",
            "tozes",
            "tozie",
            "trabs",
            "trads",
            "tragi",
            "traik",
            "trams",
            "trank",
            "tranq",
            "trans",
            "trant",
            "trape",
            "traps",
            "trapt",
            "trass",
            "trats",
            "tratt",
            "trave",
            "trayf",
            "trays",
            "treck",
            "treed",
            "treen",
            "trees",
            "trefa",
            "treif",
            "treks",
            "trema",
            "trems",
            "tress",
            "trest",
            "trets",
            "trews",
            "treyf",
            "treys",
            "triac",
            "tride",
            "trier",
            "tries",
            "triff",
            "trigo",
            "trigs",
            "trike",
            "trild",
            "trill",
            "trims",
            "trine",
            "trins",
            "triol",
            "trior",
            "trios",
            "trips",
            "tripy",
            "trist",
            "troad",
            "troak",
            "troat",
            "trock",
            "trode",
            "trods",
            "trogs",
            "trois",
            "troke",
            "tromp",
            "trona",
            "tronc",
            "trone",
            "tronk",
            "trons",
            "trooz",
            "troth",
            "trots",
            "trows",
            "troys",
            "trued",
            "trues",
            "trugo",
            "trugs",
            "trull",
            "tryer",
            "tryke",
            "tryma",
            "tryps",
            "tsade",
            "tsadi",
            "tsars",
            "tsked",
            "tsuba",
            "tsubo",
            "tuans",
            "tuart",
            "tuath",
            "tubae",
            "tubar",
            "tubas",
            "tubby",
            "tubed",
            "tubes",
            "tucks",
            "tufas",
            "tuffe",
            "tuffs",
            "tufts",
            "tufty",
            "tugra",
            "tuile",
            "tuina",
            "tuism",
            "tuktu",
            "tules",
            "tulpa",
            "tulsi",
            "tumid",
            "tummy",
            "tumps",
            "tumpy",
            "tunas",
            "tunds",
            "tuned",
            "tuner",
            "tunes",
            "tungs",
            "tunny",
            "tupek",
            "tupik",
            "tuple",
            "tuque",
            "turds",
            "turfs",
            "turfy",
            "turks",
            "turme",
            "turms",
            "turns",
            "turnt",
            "turps",
            "turrs",
            "tushy",
            "tusks",
            "tusky",
            "tutee",
            "tutti",
            "tutty",
            "tutus",
            "tuxes",
            "tuyer",
            "twaes",
            "twain",
            "twals",
            "twank",
            "twats",
            "tways",
            "tweel",
            "tween",
            "tweep",
            "tweer",
            "twerk",
            "twerp",
            "twier",
            "twigs",
            "twill",
            "twilt",
            "twink",
            "twins",
            "twiny",
            "twire",
            "twirp",
            "twite",
            "twits",
            "twoer",
            "twyer",
            "tyees",
            "tyers",
            "tyiyn",
            "tykes",
            "tyler",
            "tymps",
            "tynde",
            "tyned",
            "tynes",
            "typal",
            "typed",
            "types",
            "typey",
            "typic",
            "typos",
            "typps",
            "typto",
            "tyran",
            "tyred",
            "tyres",
            "tyros",
            "tythe",
            "tzars",
            "udals",
            "udons",
            "ugali",
            "ugged",
            "uhlan",
            "uhuru",
            "ukase",
            "ulama",
            "ulans",
            "ulema",
            "ulmin",
            "ulnad",
            "ulnae",
            "ulnar",
            "ulnas",
            "ulpan",
            "ulvas",
            "ulyie",
            "ulzie",
            "umami",
            "umbel",
            "umber",
            "umble",
            "umbos",
            "umbre",
            "umiac",
            "umiak",
            "umiaq",
            "ummah",
            "ummas",
            "ummed",
            "umped",
            "umphs",
            "umpie",
            "umpty",
            "umrah",
            "umras",
            "unais",
            "unapt",
            "unarm",
            "unary",
            "unaus",
            "unbag",
            "unban",
            "unbar",
            "unbed",
            "unbid",
            "unbox",
            "uncap",
            "unces",
            "uncia",
            "uncos",
            "uncoy",
            "uncus",
            "undam",
            "undee",
            "undos",
            "undug",
            "uneth",
            "unfix",
            "ungag",
            "unget",
            "ungod",
            "ungot",
            "ungum",
            "unhat",
            "unhip",
            "unica",
            "units",
            "unjam",
            "unked",
            "unket",
            "unkid",
            "unlaw",
            "unlay",
            "unled",
            "unlet",
            "unlid",
            "unman",
            "unmew",
            "unmix",
            "unpay",
            "unpeg",
            "unpen",
            "unpin",
            "unred",
            "unrid",
            "unrig",
            "unrip",
            "unsaw",
            "unsay",
            "unsee",
            "unsew",
            "unsex",
            "unsod",
            "untax",
            "untin",
            "unwet",
            "unwit",
            "unwon",
            "upbow",
            "upbye",
            "updos",
            "updry",
            "upend",
            "upjet",
            "uplay",
            "upled",
            "uplit",
            "upped",
            "upran",
            "uprun",
            "upsee",
            "upsey",
            "uptak",
            "upter",
            "uptie",
            "uraei",
            "urali",
            "uraos",
            "urare",
            "urari",
            "urase",
            "urate",
            "urbex",
            "urbia",
            "urdee",
            "ureal",
            "ureas",
            "uredo",
            "ureic",
            "urena",
            "urent",
            "urged",
            "urger",
            "urges",
            "urial",
            "urite",
            "urman",
            "urnal",
            "urned",
            "urped",
            "ursae",
            "ursid",
            "urson",
            "urubu",
            "urvas",
            "users",
            "usnea",
            "usque",
            "usure",
            "usury",
            "uteri",
            "uveal",
            "uveas",
            "uvula",
            "vacua",
            "vaded",
            "vades",
            "vagal",
            "vagus",
            "vails",
            "vaire",
            "vairs",
            "vairy",
            "vakas",
            "vakil",
            "vales",
            "valis",
            "valse",
            "vamps",
            "vampy",
            "vanda",
            "vaned",
            "vanes",
            "vangs",
            "vants",
            "vaped",
            "vaper",
            "vapes",
            "varan",
            "varas",
            "vardy",
            "varec",
            "vares",
            "varia",
            "varix",
            "varna",
            "varus",
            "varve",
            "vasal",
            "vases",
            "vasts",
            "vasty",
            "vatic",
            "vatus",
            "vauch",
            "vaute",
            "vauts",
            "vawte",
            "vaxes",
            "veale",
            "veals",
            "vealy",
            "veena",
            "veeps",
            "veers",
            "veery",
            "vegas",
            "veges",
            "vegie",
            "vegos",
            "vehme",
            "veils",
            "veily",
            "veins",
            "veiny",
            "velar",
            "velds",
            "veldt",
            "veles",
            "vells",
            "velum",
            "venae",
            "venal",
            "vends",
            "vendu",
            "veney",
            "venge",
            "venin",
            "vents",
            "venus",
            "verbs",
            "verra",
            "verry",
            "verst",
            "verts",
            "vertu",
            "vespa",
            "vesta",
            "vests",
            "vetch",
            "vexed",
            "vexer",
            "vexes",
            "vexil",
            "vezir",
            "vials",
            "viand",
            "vibes",
            "vibex",
            "vibey",
            "viced",
            "vices",
            "vichy",
            "viers",
            "views",
            "viewy",
            "vifda",
            "viffs",
            "vigas",
            "vigia",
            "vilde",
            "viler",
            "villi",
            "vills",
            "vimen",
            "vinal",
            "vinas",
            "vinca",
            "vined",
            "viner",
            "vines",
            "vinew",
            "vinic",
            "vinos",
            "vints",
            "viold",
            "viols",
            "vired",
            "vireo",
            "vires",
            "virga",
            "virge",
            "virid",
            "virls",
            "virtu",
            "visas",
            "vised",
            "vises",
            "visie",
            "visne",
            "vison",
            "visto",
            "vitae",
            "vitas",
            "vitex",
            "vitro",
            "vitta",
            "vivas",
            "vivat",
            "vivda",
            "viver",
            "vives",
            "vizir",
            "vizor",
            "vleis",
            "vlies",
            "vlogs",
            "voars",
            "vocab",
            "voces",
            "voddy",
            "vodou",
            "vodun",
            "voema",
            "vogie",
            "voids",
            "voile",
            "voips",
            "volae",
            "volar",
            "voled",
            "voles",
            "volet",
            "volks",
            "volta",
            "volte",
            "volti",
            "volts",
            "volva",
            "volve",
            "vomer",
            "voted",
            "votes",
            "vouge",
            "voulu",
            "vowed",
            "vower",
            "voxel",
            "vozhd",
            "vraic",
            "vrils",
            "vroom",
            "vrous",
            "vrouw",
            "vrows",
            "vuggs",
            "vuggy",
            "vughs",
            "vughy",
            "vulgo",
            "vulns",
            "vulva",
            "vutty",
            "waacs",
            "wacke",
            "wacko",
            "wacks",
            "wadds",
            "waddy",
            "waded",
            "wader",
            "wades",
            "wadge",
            "wadis",
            "wadts",
            "waffs",
            "wafts",
            "waged",
            "wages",
            "wagga",
            "wagyu",
            "wahoo",
            "waide",
            "waifs",
            "waift",
            "wails",
            "wains",
            "wairs",
            "waite",
            "waits",
            "wakas",
            "waked",
            "waken",
            "waker",
            "wakes",
            "wakfs",
            "waldo",
            "walds",
            "waled",
            "waler",
            "wales",
            "walie",
            "walis",
            "walks",
            "walla",
            "walls",
            "wally",
            "walty",
            "wamed",
            "wames",
            "wamus",
            "wands",
            "waned",
            "wanes",
            "waney",
            "wangs",
            "wanks",
            "wanky",
            "wanle",
            "wanly",
            "wanna",
            "wants",
            "wanty",
            "wanze",
            "waqfs",
            "warbs",
            "warby",
            "wards",
            "wared",
            "wares",
            "warez",
            "warks",
            "warms",
            "warns",
            "warps",
            "warre",
            "warst",
            "warts",
            "wases",
            "washy",
            "wasms",
            "wasps",
            "waspy",
            "wasts",
            "watap",
            "watts",
            "wauff",
            "waugh",
            "wauks",
            "waulk",
            "wauls",
            "waurs",
            "waved",
            "waves",
            "wavey",
            "wawas",
            "wawes",
            "wawls",
            "waxed",
            "waxer",
            "waxes",
            "wayed",
            "wazir",
            "wazoo",
            "weald",
            "weals",
            "weamb",
            "weans",
            "wears",
            "webby",
            "weber",
            "wecht",
            "wedel",
            "wedgy",
            "weeds",
            "weeke",
            "weeks",
            "weels",
            "weems",
            "weens",
            "weeny",
            "weeps",
            "weepy",
            "weest",
            "weete",
            "weets",
            "wefte",
            "wefts",
            "weids",
            "weils",
            "weirs",
            "weise",
            "weize",
            "wekas",
            "welds",
            "welke",
            "welks",
            "welkt",
            "wells",
            "welly",
            "welts",
            "wembs",
            "wends",
            "wenge",
            "wenny",
            "wents",
            "weros",
            "wersh",
            "wests",
            "wetas",
            "wetly",
            "wexed",
            "wexes",
            "whamo",
            "whams",
            "whang",
            "whaps",
            "whare",
            "whata",
            "whats",
            "whaup",
            "whaur",
            "wheal",
            "whear",
            "wheen",
            "wheep",
            "wheft",
            "whelk",
            "whelm",
            "whens",
            "whets",
            "whews",
            "wheys",
            "whids",
            "whift",
            "whigs",
            "whilk",
            "whims",
            "whins",
            "whios",
            "whips",
            "whipt",
            "whirr",
            "whirs",
            "whish",
            "whiss",
            "whist",
            "whits",
            "whity",
            "whizz",
            "whomp",
            "whoof",
            "whoot",
            "whops",
            "whore",
            "whorl",
            "whort",
            "whoso",
            "whows",
            "whump",
            "whups",
            "whyda",
            "wicca",
            "wicks",
            "wicky",
            "widdy",
            "wides",
            "wiels",
            "wifed",
            "wifes",
            "wifey",
            "wifie",
            "wifty",
            "wigan",
            "wigga",
            "wiggy",
            "wikis",
            "wilco",
            "wilds",
            "wiled",
            "wiles",
            "wilga",
            "wilis",
            "wilja",
            "wills",
            "wilts",
            "wimps",
            "winds",
            "wined",
            "wines",
            "winey",
            "winge",
            "wings",
            "wingy",
            "winks",
            "winna",
            "winns",
            "winos",
            "winze",
            "wiped",
            "wiper",
            "wipes",
            "wired",
            "wirer",
            "wires",
            "wirra",
            "wised",
            "wises",
            "wisha",
            "wisht",
            "wisps",
            "wists",
            "witan",
            "wited",
            "wites",
            "withe",
            "withs",
            "withy",
            "wived",
            "wiver",
            "wives",
            "wizen",
            "wizes",
            "woads",
            "woald",
            "wocks",
            "wodge",
            "woful",
            "wojus",
            "woker",
            "wokka",
            "wolds",
            "wolfs",
            "wolly",
            "wolve",
            "wombs",
            "womby",
            "womyn",
            "wonga",
            "wongi",
            "wonks",
            "wonky",
            "wonts",
            "woods",
            "wooed",
            "woofs",
            "woofy",
            "woold",
            "wools",
            "woons",
            "woops",
            "woopy",
            "woose",
            "woosh",
            "wootz",
            "words",
            "works",
            "worms",
            "wormy",
            "worts",
            "wowed",
            "wowee",
            "woxen",
            "wrang",
            "wraps",
            "wrapt",
            "wrast",
            "wrate",
            "wrawl",
            "wrens",
            "wrick",
            "wried",
            "wrier",
            "wries",
            "writs",
            "wroke",
            "wroot",
            "wroth",
            "wryer",
            "wuddy",
            "wudus",
            "wulls",
            "wurst",
            "wuses",
            "wushu",
            "wussy",
            "wuxia",
            "wyled",
            "wyles",
            "wynds",
            "wynns",
            "wyted",
            "wytes",
            "xebec",
            "xenia",
            "xenic",
            "xenon",
            "xeric",
            "xerox",
            "xerus",
            "xoana",
            "xrays",
            "xylan",
            "xylem",
            "xylic",
            "xylol",
            "xylyl",
            "xysti",
            "xysts",
            "yaars",
            "yabas",
            "yabba",
            "yabby",
            "yacca",
            "yacka",
            "yacks",
            "yaffs",
            "yager",
            "yages",
            "yagis",
            "yahoo",
            "yaird",
            "yakka",
            "yakow",
            "yales",
            "yamen",
            "yampy",
            "yamun",
            "yangs",
            "yanks",
            "yapok",
            "yapon",
            "yapps",
            "yappy",
            "yarak",
            "yarco",
            "yards",
            "yarer",
            "yarfa",
            "yarks",
            "yarns",
            "yarrs",
            "yarta",
            "yarto",
            "yates",
            "yauds",
            "yauld",
            "yaups",
            "yawed",
            "yawey",
            "yawls",
            "yawns",
            "yawny",
            "yawps",
            "ybore",
            "yclad",
            "ycled",
            "ycond",
            "ydrad",
            "ydred",
            "yeads",
            "yeahs",
            "yealm",
            "yeans",
            "yeard",
            "years",
            "yecch",
            "yechs",
            "yechy",
            "yedes",
            "yeeds",
            "yeesh",
            "yeggs",
            "yelks",
            "yells",
            "yelms",
            "yelps",
            "yelts",
            "yenta",
            "yente",
            "yerba",
            "yerds",
            "yerks",
            "yeses",
            "yesks",
            "yests",
            "yesty",
            "yetis",
            "yetts",
            "yeuks",
            "yeuky",
            "yeven",
            "yeves",
            "yewen",
            "yexed",
            "yexes",
            "yfere",
            "yiked",
            "yikes",
            "yills",
            "yince",
            "yipes",
            "yippy",
            "yirds",
            "yirks",
            "yirrs",
            "yirth",
            "yites",
            "yitie",
            "ylems",
            "ylike",
            "ylkes",
            "ymolt",
            "ympes",
            "yobbo",
            "yobby",
            "yocks",
            "yodel",
            "yodhs",
            "yodle",
            "yogas",
            "yogee",
            "yoghs",
            "yogic",
            "yogin",
            "yogis",
            "yoick",
            "yojan",
            "yoked",
            "yokel",
            "yoker",
            "yokes",
            "yokul",
            "yolks",
            "yolky",
            "yomim",
            "yomps",
            "yonic",
            "yonis",
            "yonks",
            "yoofs",
            "yoops",
            "yores",
            "yorks",
            "yorps",
            "youks",
            "yourn",
            "yours",
            "yourt",
            "youse",
            "yowed",
            "yowes",
            "yowie",
            "yowls",
            "yowza",
            "yrapt",
            "yrent",
            "yrivd",
            "yrneh",
            "ysame",
            "ytost",
            "yuans",
            "yucas",
            "yucca",
            "yucch",
            "yucko",
            "yucks",
            "yucky",
            "yufts",
            "yugas",
            "yuked",
            "yukes",
            "yukky",
            "yukos",
            "yulan",
            "yules",
            "yummo",
            "yummy",
            "yumps",
            "yupon",
            "yuppy",
            "yurta",
            "yurts",
            "yuzus",
            "zabra",
            "zacks",
            "zaida",
            "zaidy",
            "zaire",
            "zakat",
            "zaman",
            "zambo",
            "zamia",
            "zanja",
            "zante",
            "zanza",
            "zanze",
            "zappy",
            "zarfs",
            "zaris",
            "zatis",
            "zaxes",
            "zayin",
            "zazen",
            "zeals",
            "zebec",
            "zebub",
            "zebus",
            "zedas",
            "zeins",
            "zendo",
            "zerda",
            "zerks",
            "zeros",
            "zests",
            "zetas",
            "zexes",
            "zezes",
            "zhomo",
            "zibet",
            "ziffs",
            "zigan",
            "zilas",
            "zilch",
            "zilla",
            "zills",
            "zimbi",
            "zimbs",
            "zinco",
            "zincs",
            "zincy",
            "zineb",
            "zines",
            "zings",
            "zingy",
            "zinke",
            "zinky",
            "zippo",
            "zippy",
            "ziram",
            "zitis",
            "zizel",
            "zizit",
            "zlote",
            "zloty",
            "zoaea",
            "zobos",
            "zobus",
            "zocco",
            "zoeae",
            "zoeal",
            "zoeas",
            "zoism",
            "zoist",
            "zombi",
            "zonae",
            "zonda",
            "zoned",
            "zoner",
            "zones",
            "zonks",
            "zooea",
            "zooey",
            "zooid",
            "zooks",
            "zooms",
            "zoons",
            "zooty",
            "zoppa",
            "zoppo",
            "zoril",
            "zoris",
            "zorro",
            "zouks",
            "zowee",
            "zowie",
            "zulus",
            "zupan",
            "zupas",
            "zuppa",
            "zurfs",
            "zuzim",
            "zygal",
            "zygon",
            "zymes",
            "zymic"
        ]
    };

    const ROWS = 6;
    const COLS = 5;
    const words = Object.assign(Object.assign({}, words$1), { contains: (word) => {
            return words$1.words.includes(word) || words$1.valid.includes(word);
        } });
    class Tile$1 {
        constructor() {
            this.notSet = new Set();
        }
        not(char) {
            this.notSet.add(char);
        }
    }
    class WordData {
        constructor() {
            this.notSet = new Set();
            this.letterCounts = new Map();
            this.word = [];
            for (let col = 0; col < COLS; ++col) {
                this.word.push(new Tile$1());
            }
        }
        confirmCount(char) {
            let c = this.letterCounts.get(char);
            if (!c) {
                this.not(char);
            }
            else {
                c[1] = true;
            }
        }
        countConfirmed(char) {
            const val = this.letterCounts.get(char);
            return val ? val[1] : false;
        }
        setCount(char, count) {
            let c = this.letterCounts.get(char);
            if (!c) {
                this.letterCounts.set(char, [count, false]);
            }
            else {
                c[0] = count;
            }
        }
        incrementCount(char) {
            ++this.letterCounts.get(char)[0];
        }
        not(char) {
            this.notSet.add(char);
        }
        inGlobalNotList(char) {
            return this.notSet.has(char);
        }
        lettersNotAt(pos) {
            return new Set([...this.notSet, ...this.word[pos].notSet]);
        }
    }
    function getRowData(n, board) {
        const wd = new WordData();
        for (let row = 0; row < n; ++row) {
            const occured = new Set();
            for (let col = 0; col < COLS; ++col) {
                const state = board.state[row][col];
                const char = board.words[row][col];
                if (state === "⬛") {
                    wd.confirmCount(char);
                    // if char isn't in the global not list add it to the not list for that position
                    if (!wd.inGlobalNotList(char)) {
                        wd.word[col].not(char);
                    }
                    continue;
                }
                // If this isn't the first time this letter has occured in this row
                if (occured.has(char)) {
                    wd.incrementCount(char);
                }
                else if (!wd.countConfirmed(char)) {
                    occured.add(char);
                    wd.setCount(char, 1);
                }
                if (state === "🟩") {
                    wd.word[col].value = char;
                }
                else { // if (state === "🟨")
                    wd.word[col].not(char);
                }
            }
        }
        let exp = "";
        for (let pos = 0; pos < wd.word.length; ++pos) {
            exp += wd.word[pos].value ? wd.word[pos].value : `[^${[...wd.lettersNotAt(pos)].join(" ")}]`;
        }
        return (word) => {
            if (new RegExp(exp).test(word)) {
                const chars = word.split("");
                for (const e of wd.letterCounts) {
                    const occurences = countOccurences(chars, e[0]);
                    if (!occurences || (e[1][1] && occurences !== e[1][0]))
                        return false;
                }
                return true;
            }
            return false;
        };
    }
    function countOccurences(arr, val) {
        return arr.reduce((count, v) => v === val ? count + 1 : count, 0);
    }
    // word: the actual secret word
    // guess: the current guess entered by the user
    function getState(word, guess) {
        // ORIGINAL
        console.log(word);
        const secret_word_char_array = word.split("");
        const result = Array(5).fill("⬛");
        // Check if the character is correct, and should be marked green.
        for (let i = 0; i < word.length; ++i) {
            if (secret_word_char_array[i] === guess.charAt(i)) {
                result[i] = "🟩";
                // Set to $ to prevent duplicate letters from being marked as yellow
                // later, if it's already been marked green here.
                secret_word_char_array[i] = "$";
            }
        }
        // Check for a correct letter in the wrong position
        for (let i = 0; i < word.length; ++i) {
            const pos = secret_word_char_array.indexOf(guess[i]);
            if (result[i] !== "🟩" && pos >= 0) {
                secret_word_char_array[pos] = "$";
                result[i] = "🟨";
            }
        }
        return result;
        // const result = Array<LetterState>(5).fill("🟩");
        // return result;
    }
    function contractNum(n) {
        switch (n % 10) {
            case 1: return `${n}st`;
            case 2: return `${n}nd`;
            case 3: return `${n}rd`;
            default: return `${n}th`;
        }
    }
    const keys = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    // This function returns a random seed used to select the secret word,
    // based on the current date and time.
    function newSeed() {
        const now = Date.now();
        return now - (now % ms.SECOND);
    }
    const modeData = {
        default: GameMode.infinite,
        modes: [
            {
                name: "Daily",
                unit: ms.DAY,
                start: 1642370400000,
                seed: newSeed(),
                historical: false,
                streak: true,
                useTimeZone: true,
            },
            {
                name: "Hourly",
                unit: ms.HOUR,
                start: 1642528800000,
                seed: newSeed(),
                historical: false,
                icon: "m50,7h100v33c0,40 -35,40 -35,60c0,20 35,20 35,60v33h-100v-33c0,-40 35,-40 35,-60c0,-20 -35,-20 -35,-60z",
                streak: true,
            },
            {
                name: "Infinite",
                unit: ms.SECOND,
                start: 1642428600000,
                seed: newSeed(),
                historical: false,
                icon: "m7,100c0,-50 68,-50 93,0c25,50 93,50 93,0c0,-50 -68,-50 -93,0c-25,50 -93,50 -93,0z",
            },
            // {
            // 	name: "Minutely",
            // 	unit: ms.MINUTE,
            // 	start: 1642528800000,	// 18/01/2022 8:00pm
            // 	seed: newSeed(GameMode.minutely),
            // 	historical: false,
            // 	icon: "m7,200v-200l93,100l93,-100v200",
            // 	streak: true,
            // },
        ]
    };
    function getWordNumber(mode) {
        return Math.round((modeData.modes[mode].seed - modeData.modes[mode].start) / modeData.modes[mode].unit) + 1;
    }
    function seededRandomInt(min, max, seed) {
        const rng = seedrandom(`${seed}`);
        return Math.floor(min + (max - min) * rng());
    }
    const DELAY_INCREMENT = 200;
    const PRAISE = [
        "Genius",
        "Magnificent",
        "Impressive",
        "Splendid",
        "Great",
        "Phew",
    ];
    function createNewGame(mode) {
        return {
            active: true,
            guesses: 0,
            time: modeData.modes[mode].seed,
            wordNumber: getWordNumber(mode),
            validHard: true,
            board: {
                words: Array(ROWS).fill(""),
                state: Array.from({ length: ROWS }, () => (Array(COLS).fill("🔳")))
            },
        };
    }
    function createDefaultSettings() {
        return {
            hard: new Array(modeData.modes.length).map(() => false),
            dark: true,
            colorblind: false,
            tutorial: 3,
        };
    }
    function createDefaultStats(mode) {
        const stats = {
            played: 0,
            lastGame: 0,
            guesses: {
                fail: 0,
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
            }
        };
        if (!modeData.modes[mode].streak)
            return stats;
        return Object.assign(Object.assign({}, stats), { streak: 0, maxStreak: 0 });
    }
    function createLetterStates() {
        return {
            a: "🔳",
            b: "🔳",
            c: "🔳",
            d: "🔳",
            e: "🔳",
            f: "🔳",
            g: "🔳",
            h: "🔳",
            i: "🔳",
            j: "🔳",
            k: "🔳",
            l: "🔳",
            m: "🔳",
            n: "🔳",
            o: "🔳",
            p: "🔳",
            q: "🔳",
            r: "🔳",
            s: "🔳",
            t: "🔳",
            u: "🔳",
            v: "🔳",
            w: "🔳",
            x: "🔳",
            y: "🔳",
            z: "🔳",
        };
    }
    function timeRemaining(m) {
        if (m.useTimeZone) {
            return m.unit - (Date.now() - (m.seed + new Date().getTimezoneOffset() * ms.MINUTE));
        }
        return m.unit - (Date.now() - m.seed);
    }
    function failed(s) {
        return !(s.active || (s.guesses > 0 && s.board.state[s.guesses - 1].join("") === "🟩".repeat(COLS)));
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* src/components/GameIcon.svelte generated by Svelte v3.50.1 */

    const file$k = "src/components/GameIcon.svelte";

    function create_fragment$l(ctx) {
    	let svg;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-17ud64h");
    			add_location(svg, file$k, 3, 0, 61);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					svg,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[0])) /*onClick*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GameIcon', slots, ['default']);

    	let { onClick = () => {
    		
    	} } = $$props;

    	const writable_props = ['onClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GameIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('onClick' in $$props) $$invalidate(0, onClick = $$props.onClick);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onClick });

    	$$self.$inject_state = $$props => {
    		if ('onClick' in $$props) $$invalidate(0, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onClick, $$scope, slots];
    }

    class GameIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { onClick: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameIcon",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get onClick() {
    		throw new Error("<GameIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<GameIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.50.1 */
    const file$j = "src/components/Header.svelte";

    // (11:2) <GameIcon onClick={() => dispatch("tutorial")}>
    function create_default_slot_2$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z");
    			add_location(path, file$j, 11, 3, 379);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(11:2) <GameIcon onClick={() => dispatch(\\\"tutorial\\\")}>",
    		ctx
    	});

    	return block;
    }

    // (21:2) {#if showStats}
    function create_if_block$5(ctx) {
    	let gameicon;
    	let current;

    	gameicon = new GameIcon({
    			props: {
    				onClick: /*func_1*/ ctx[3],
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gameicon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gameicon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gameicon_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				gameicon_changes.$$scope = { dirty, ctx };
    			}

    			gameicon.$set(gameicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(gameicon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(21:2) {#if showStats}",
    		ctx
    	});

    	return block;
    }

    // (22:3) <GameIcon onClick={() => dispatch("stats")}>
    function create_default_slot_1$2(ctx) {
    	let path;
    	let path_transition;
    	let current;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z");
    			add_location(path, file$j, 22, 4, 778);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!path_transition) path_transition = create_bidirectional_transition(path, fade, { duration: 200 }, true);
    				path_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!path_transition) path_transition = create_bidirectional_transition(path, fade, { duration: 200 }, false);
    			path_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    			if (detaching && path_transition) path_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(22:3) <GameIcon onClick={() => dispatch(\\\"stats\\\")}>",
    		ctx
    	});

    	return block;
    }

    // (29:2) <GameIcon onClick={() => dispatch("settings")}>
    function create_default_slot$4(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z");
    			add_location(path, file$j, 29, 3, 997);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(29:2) <GameIcon onClick={() => dispatch(\\\"settings\\\")}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let header;
    	let div0;
    	let gameicon0;
    	let t0;
    	let h1;
    	let t2;
    	let div1;
    	let t3;
    	let gameicon1;
    	let current;

    	gameicon0 = new GameIcon({
    			props: {
    				onClick: /*func*/ ctx[2],
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*showStats*/ ctx[0] && create_if_block$5(ctx);

    	gameicon1 = new GameIcon({
    			props: {
    				onClick: /*func_2*/ ctx[4],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			create_component(gameicon0.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "tuffle";
    			t2 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t3 = space();
    			create_component(gameicon1.$$.fragment);
    			attr_dev(div0, "class", "icons svelte-uuxvql");
    			add_location(div0, file$j, 9, 1, 306);
    			attr_dev(h1, "class", "svelte-uuxvql");
    			add_location(h1, file$j, 16, 1, 666);
    			attr_dev(div1, "class", "icons svelte-uuxvql");
    			add_location(div1, file$j, 19, 1, 688);
    			attr_dev(header, "class", "svelte-uuxvql");
    			add_location(header, file$j, 8, 0, 296);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			mount_component(gameicon0, div0, null);
    			append_dev(header, t0);
    			append_dev(header, h1);
    			append_dev(header, t2);
    			append_dev(header, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t3);
    			mount_component(gameicon1, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const gameicon0_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				gameicon0_changes.$$scope = { dirty, ctx };
    			}

    			gameicon0.$set(gameicon0_changes);

    			if (/*showStats*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showStats*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t3);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const gameicon1_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				gameicon1_changes.$$scope = { dirty, ctx };
    			}

    			gameicon1.$set(gameicon1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameicon0.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(gameicon1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameicon0.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(gameicon1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(gameicon0);
    			if (if_block) if_block.d();
    			destroy_component(gameicon1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { showStats } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ['showStats'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const func = () => dispatch("tutorial");
    	const func_1 = () => dispatch("stats");
    	const func_2 = () => dispatch("settings");

    	$$self.$$set = $$props => {
    		if ('showStats' in $$props) $$invalidate(0, showStats = $$props.showStats);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		getContext,
    		scale,
    		fade,
    		modeData,
    		timeRemaining,
    		GameIcon,
    		showStats,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('showStats' in $$props) $$invalidate(0, showStats = $$props.showStats);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showStats, dispatch, func, func_1, func_2];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { showStats: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*showStats*/ ctx[0] === undefined && !('showStats' in props)) {
    			console.warn("<Header> was created without expected prop 'showStats'");
    		}
    	}

    	get showStats() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showStats(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let backendURL$1 = "";
    // setBackendURL sets the backend URL for the server API. It is exported for
    // stores.ts to modify. This avoids a circular dependency.
    function setBackendURL(url) {
        backendURL$1 = url;
    }
    async function wordleKeyPressed(key) {
        const response = await fetch(`${backendURL$1}/wordle_key_pressed/` + key);
        const data = await response.json();
        return cleanResponse(data);
    }
    async function checkGuess() {
        const response = await fetch(`${backendURL$1}/enter_pressed`);
        const data = await response.json();
        return cleanResponse(data);
    }
    async function deleteKeyPressed() {
        const response = await fetch(`${backendURL$1}/delete_pressed`);
        const data = await response.json();
        return cleanResponse(data);
    }
    async function newGame() {
        const response = await fetch(`${backendURL$1}/new_game`);
        const data = await response.json();
        return cleanResponse(data);
    }
    function cleanResponse(data) {
        let server_response = {
            answer: data["answer"],
            boardColors: data["boardColors"],
            guessedWords: data["guessedWords"],
            letterColors: data["letterColors"],
            gameStatus: data["gameStatus"],
            errorMessage: data["errorMessage"],
        };
        let cleanedGuesses = server_response.guessedWords.concat(Array(ROWS - server_response.guessedWords.length)
            .fill(""));
        let cleanedColors = server_response.boardColors.concat(Array(ROWS - server_response.boardColors.length)
            .fill("BBBBB"));
        let cleanedLetterColors = (server_response.letterColors
            + "BBBBBBBBBBBBBBBBBBBBBBBBBB").substring(0, 26);
        let cleaned_server_response = {
            answer: data["answer"],
            boardColors: cleanedColors,
            guessedWords: cleanedGuesses,
            letterColors: cleanedLetterColors,
            gameStatus: data["gameStatus"],
            errorMessage: data["errorMessage"],
        };
        return cleaned_server_response;
    }
    function emptyResponse() {
        return {
            guessedWords: Array(6).fill(""),
            boardColors: Array(6).fill("BBBBB"),
            letterColors: "BBBBBBBBBBBBBBBBBBBBBBBBBB",
        };
    }
    // Returns a 2D array representing the letter colors.
    function boardStateFromServerResponse(server_response) {
        let boardColors = server_response["boardColors"];
        let letterStates = [];
        for (let i = 0; i < boardColors.length; i++) {
            letterStates.push([]);
            for (let j = 0; j < boardColors[i].length; j++) {
                switch (boardColors[i][j]) {
                    case "G":
                        letterStates[i].push("🟩");
                        break;
                    case "Y":
                        letterStates[i].push("🟨");
                        break;
                    case "B":
                    default:
                        letterStates[i].push("⬛");
                        break;
                }
            }
        }
        return letterStates;
    }
    function letterStateFromServerResponse(server_response) {
        let letterColors = server_response["letterColors"];
        let letterStates = createLetterStates();
        let letters = "abcdefghijklmnopqrstuvwxyz";
        for (let i = 0; i < letters.length; i++) {
            let val;
            switch (letterColors[i]) {
                case "G":
                    val = "🟩";
                    break;
                case "Y":
                    val = "🟨";
                    break;
                case "D":
                    val = "⬛";
                    break;
                case "B":
                default:
                    val = "🔳";
                    break;
            }
            letterStates[letters[i]] = val;
        }
        return letterStates;
    }

    // BACKEND_URL is the base URL to the Backend. You can optionally set this
    // variable with your own, e.g. "https://wordlebackend-1.amajc.repl.co".
    // If this is set to "localstorage", then Tuffle will prompt the user.
    const BACKEND_URL = 'https://tuffle-backend-solution.amajc.repl.co';

    const mode = writable();
    const letterStates = writable(createLetterStates());
    const settings = writable(createDefaultSettings());
    const server_response = writable(emptyResponse());
    // backendURL is a pubsub variable that stores the backend URL.
    const backendURL = writable(getBackendURL());
    backendURL.subscribe(url => localStorage.setItem("backendURL", url));
    backendURL.subscribe(url => setBackendURL(url));
    function getBackendURL() {
        if (localStorage) {
            return localStorage.getItem("backendURL") || BACKEND_URL;
        }
        return BACKEND_URL;
    }

    /* src/components/board/Tile.svelte generated by Svelte v3.50.1 */
    const file$i = "src/components/board/Tile.svelte";

    function create_fragment$j(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2_class_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*value*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*value*/ ctx[0]);
    			attr_dev(div0, "class", "front svelte-frmspd");
    			add_location(div0, file$i, 32, 1, 939);
    			attr_dev(div1, "class", "back svelte-frmspd");
    			add_location(div1, file$i, 33, 1, 973);
    			attr_dev(div2, "data-animation", /*animation*/ ctx[5]);
    			attr_dev(div2, "class", div2_class_value = "tile " + /*state*/ ctx[1] + " " + /*s*/ ctx[3] + " svelte-frmspd");
    			set_style(div2, "transition-delay", /*position*/ ctx[2] * DELAY_INCREMENT + "ms");
    			toggle_class(div2, "value", /*value*/ ctx[0]);
    			toggle_class(div2, "pop", /*pop*/ ctx[4]);
    			add_location(div2, file$i, 25, 0, 795);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t0, /*value*/ ctx[0]);
    			if (dirty & /*value*/ 1) set_data_dev(t2, /*value*/ ctx[0]);

    			if (dirty & /*animation*/ 32) {
    				attr_dev(div2, "data-animation", /*animation*/ ctx[5]);
    			}

    			if (dirty & /*state, s*/ 10 && div2_class_value !== (div2_class_value = "tile " + /*state*/ ctx[1] + " " + /*s*/ ctx[3] + " svelte-frmspd")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*position*/ 4) {
    				set_style(div2, "transition-delay", /*position*/ ctx[2] * DELAY_INCREMENT + "ms");
    			}

    			if (dirty & /*state, s, value*/ 11) {
    				toggle_class(div2, "value", /*value*/ ctx[0]);
    			}

    			if (dirty & /*state, s, pop*/ 26) {
    				toggle_class(div2, "pop", /*pop*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tile', slots, []);
    	let { value = "" } = $$props;
    	let { state } = $$props;
    	let { position = 0 } = $$props;

    	function bounce() {
    		setTimeout(() => $$invalidate(5, animation = "bounce"), (ROWS + position) * DELAY_INCREMENT);
    	}

    	let s;
    	let pop = false;
    	let animation = "";

    	// ensure all animations play
    	const unsub = mode.subscribe(() => {
    		$$invalidate(5, animation = "");
    		$$invalidate(3, s = "🔳");
    		setTimeout(() => $$invalidate(3, s = ""), 10);
    	});

    	// prevent pop animation from playing at the beginning
    	setTimeout(() => $$invalidate(4, pop = true), 200);

    	onDestroy(unsub);
    	const writable_props = ['value', 'state', 'position'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('state' in $$props) $$invalidate(1, state = $$props.state);
    		if ('position' in $$props) $$invalidate(2, position = $$props.position);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		mode,
    		DELAY_INCREMENT,
    		ROWS,
    		value,
    		state,
    		position,
    		bounce,
    		s,
    		pop,
    		animation,
    		unsub
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('state' in $$props) $$invalidate(1, state = $$props.state);
    		if ('position' in $$props) $$invalidate(2, position = $$props.position);
    		if ('s' in $$props) $$invalidate(3, s = $$props.s);
    		if ('pop' in $$props) $$invalidate(4, pop = $$props.pop);
    		if ('animation' in $$props) $$invalidate(5, animation = $$props.animation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			// reset animation when value changes, because for some reason changing anination to "" when the game is over causes the tiles to flash
    			!value && $$invalidate(5, animation = "");
    		}
    	};

    	return [value, state, position, s, pop, animation, bounce];
    }

    class Tile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {
    			value: 0,
    			state: 1,
    			position: 2,
    			bounce: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tile",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*state*/ ctx[1] === undefined && !('state' in props)) {
    			console.warn("<Tile> was created without expected prop 'state'");
    		}
    	}

    	get value() {
    		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<Tile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bounce() {
    		return this.$$.ctx[6];
    	}

    	set bounce(value) {
    		throw new Error("<Tile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/board/Row.svelte generated by Svelte v3.50.1 */
    const file$h = "src/components/board/Row.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[14] = list;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (27:1) {#each Array(COLS) as _, i}
    function create_each_block$5(ctx) {
    	let tile;
    	let i = /*i*/ ctx[15];
    	let current;
    	const assign_tile = () => /*tile_binding*/ ctx[9](tile, i);
    	const unassign_tile = () => /*tile_binding*/ ctx[9](null, i);

    	let tile_props = {
    		state: /*state*/ ctx[3][/*i*/ ctx[15]],
    		value: /*value*/ ctx[2].charAt(/*i*/ ctx[15]),
    		position: /*i*/ ctx[15]
    	};

    	tile = new Tile({ props: tile_props, $$inline: true });
    	assign_tile();

    	const block = {
    		c: function create() {
    			create_component(tile.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tile, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (i !== /*i*/ ctx[15]) {
    				unassign_tile();
    				i = /*i*/ ctx[15];
    				assign_tile();
    			}

    			const tile_changes = {};
    			if (dirty & /*state*/ 8) tile_changes.state = /*state*/ ctx[3][/*i*/ ctx[15]];
    			if (dirty & /*value*/ 4) tile_changes.value = /*value*/ ctx[2].charAt(/*i*/ ctx[15]);
    			tile.$set(tile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tile.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tile.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			unassign_tile();
    			destroy_component(tile, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(27:1) {#each Array(COLS) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = Array(COLS);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "board-row svelte-ssibky");
    			attr_dev(div, "data-animation", /*animation*/ ctx[4]);
    			toggle_class(div, "complete", /*guesses*/ ctx[0] > /*num*/ ctx[1]);
    			add_location(div, file$h, 18, 0, 422);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "contextmenu", prevent_default(/*contextmenu_handler*/ ctx[10]), false, true, false),
    					listen_dev(div, "dblclick", prevent_default(/*dblclick_handler*/ ctx[11]), false, true, false),
    					listen_dev(div, "animationend", /*animationend_handler*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*state, value, tiles*/ 44) {
    				each_value = Array(COLS);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*animation*/ 16) {
    				attr_dev(div, "data-animation", /*animation*/ ctx[4]);
    			}

    			if (!current || dirty & /*guesses, num*/ 3) {
    				toggle_class(div, "complete", /*guesses*/ ctx[0] > /*num*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Row', slots, []);
    	let { guesses } = $$props;
    	let { num } = $$props;
    	let { value = "" } = $$props;
    	let { state } = $$props;

    	function shake() {
    		$$invalidate(4, animation = "shake");
    	}

    	function bounce() {
    		tiles.forEach(e => e.bounce());
    	}

    	const dispatch = createEventDispatcher();
    	let animation = "";
    	let tiles = [];
    	const writable_props = ['guesses', 'num', 'value', 'state'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Row> was created with unknown prop '${key}'`);
    	});

    	function tile_binding($$value, i) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			tiles[i] = $$value;
    			$$invalidate(5, tiles);
    		});
    	}

    	const contextmenu_handler = e => dispatch("ctx", { x: e.clientX, y: e.clientY });
    	const dblclick_handler = e => dispatch("ctx", { x: e.clientX, y: e.clientY });
    	const animationend_handler = () => $$invalidate(4, animation = "");

    	$$self.$$set = $$props => {
    		if ('guesses' in $$props) $$invalidate(0, guesses = $$props.guesses);
    		if ('num' in $$props) $$invalidate(1, num = $$props.num);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('state' in $$props) $$invalidate(3, state = $$props.state);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		COLS,
    		Tile,
    		guesses,
    		num,
    		value,
    		state,
    		shake,
    		bounce,
    		dispatch,
    		animation,
    		tiles
    	});

    	$$self.$inject_state = $$props => {
    		if ('guesses' in $$props) $$invalidate(0, guesses = $$props.guesses);
    		if ('num' in $$props) $$invalidate(1, num = $$props.num);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('state' in $$props) $$invalidate(3, state = $$props.state);
    		if ('animation' in $$props) $$invalidate(4, animation = $$props.animation);
    		if ('tiles' in $$props) $$invalidate(5, tiles = $$props.tiles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		guesses,
    		num,
    		value,
    		state,
    		animation,
    		tiles,
    		dispatch,
    		shake,
    		bounce,
    		tile_binding,
    		contextmenu_handler,
    		dblclick_handler,
    		animationend_handler
    	];
    }

    class Row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			guesses: 0,
    			num: 1,
    			value: 2,
    			state: 3,
    			shake: 7,
    			bounce: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Row",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*guesses*/ ctx[0] === undefined && !('guesses' in props)) {
    			console.warn("<Row> was created without expected prop 'guesses'");
    		}

    		if (/*num*/ ctx[1] === undefined && !('num' in props)) {
    			console.warn("<Row> was created without expected prop 'num'");
    		}

    		if (/*state*/ ctx[3] === undefined && !('state' in props)) {
    			console.warn("<Row> was created without expected prop 'state'");
    		}
    	}

    	get guesses() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set guesses(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get num() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set num(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shake() {
    		return this.$$.ctx[7];
    	}

    	set shake(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bounce() {
    		return this.$$.ctx[8];
    	}

    	set bounce(value) {
    		throw new Error("<Row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/board/Board.svelte generated by Svelte v3.50.1 */
    const file$g = "src/components/board/Board.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[19] = list;
    	child_ctx[20] = i;
    	return child_ctx;
    }

    // (40:1) {#each value as _, i}
    function create_each_block$4(ctx) {
    	let row;
    	let i = /*i*/ ctx[20];
    	let updating_value;
    	let current;
    	const assign_row = () => /*row_binding*/ ctx[8](row, i);
    	const unassign_row = () => /*row_binding*/ ctx[8](null, i);

    	function row_value_binding(value) {
    		/*row_value_binding*/ ctx[9](value, /*i*/ ctx[20]);
    	}

    	function ctx_handler(...args) {
    		return /*ctx_handler*/ ctx[10](/*i*/ ctx[20], ...args);
    	}

    	let row_props = {
    		num: /*i*/ ctx[20],
    		guesses: /*guesses*/ ctx[2],
    		state: /*board*/ ctx[1].state[/*i*/ ctx[20]]
    	};

    	if (/*value*/ ctx[0][/*i*/ ctx[20]] !== void 0) {
    		row_props.value = /*value*/ ctx[0][/*i*/ ctx[20]];
    	}

    	row = new Row({ props: row_props, $$inline: true });
    	assign_row();
    	binding_callbacks.push(() => bind(row, 'value', row_value_binding));
    	row.$on("ctx", ctx_handler);

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (i !== /*i*/ ctx[20]) {
    				unassign_row();
    				i = /*i*/ ctx[20];
    				assign_row();
    			}

    			const row_changes = {};
    			if (dirty & /*guesses*/ 4) row_changes.guesses = /*guesses*/ ctx[2];
    			if (dirty & /*board*/ 2) row_changes.state = /*board*/ ctx[1].state[/*i*/ ctx[20]];

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				row_changes.value = /*value*/ ctx[0][/*i*/ ctx[20]];
    				add_flush_callback(() => updating_value = false);
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			unassign_row();
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(40:1) {#each value as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div;
    	let current;
    	let each_value = /*value*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "board svelte-1y5422e");
    			add_location(div, file$g, 38, 0, 942);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*guesses, board, rows, value, context*/ 31) {
    				each_value = /*value*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Board', slots, []);
    	let { value } = $$props;
    	let { board } = $$props;
    	let { guesses } = $$props;

    	function shake(row) {
    		rows[row].shake();
    	}

    	function bounce(row) {
    		rows[row].bounce();
    	}

    	function hideCtx(e) {
    		if (!e || !e.defaultPrevented) showCtx = false;
    	}

    	const dispatch = createEventDispatcher();
    	let rows = [];
    	let showCtx = false;
    	let pAns = 0;
    	let pSols = 0;
    	let x = 0;
    	let y = 0;
    	let word = "";

    	function context(cx, cy, num, val) {
    		if (guesses >= num) {
    			x = cx;
    			y = cy;
    			showCtx = true;
    			word = guesses > num ? val : "";
    			const match = getRowData(num, board);
    			pAns = words.words.filter(w => match(w)).length;
    			pSols = pAns + words.valid.filter(w => match(w)).length;
    		}
    	}

    	const writable_props = ['value', 'board', 'guesses'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Board> was created with unknown prop '${key}'`);
    	});

    	function row_binding($$value, i) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			rows[i] = $$value;
    			$$invalidate(3, rows);
    		});
    	}

    	function row_value_binding(value$1, i) {
    		if ($$self.$$.not_equal(value[i], value$1)) {
    			value[i] = value$1;
    			$$invalidate(0, value);
    		}
    	}

    	const ctx_handler = (i, e) => context(e.detail.x, e.detail.y, i, value[i]);

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('board' in $$props) $$invalidate(1, board = $$props.board);
    		if ('guesses' in $$props) $$invalidate(2, guesses = $$props.guesses);
    	};

    	$$self.$capture_state = () => ({
    		getRowData,
    		words,
    		Row,
    		createEventDispatcher,
    		scale,
    		value,
    		board,
    		guesses,
    		shake,
    		bounce,
    		hideCtx,
    		dispatch,
    		rows,
    		showCtx,
    		pAns,
    		pSols,
    		x,
    		y,
    		word,
    		context
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('board' in $$props) $$invalidate(1, board = $$props.board);
    		if ('guesses' in $$props) $$invalidate(2, guesses = $$props.guesses);
    		if ('rows' in $$props) $$invalidate(3, rows = $$props.rows);
    		if ('showCtx' in $$props) showCtx = $$props.showCtx;
    		if ('pAns' in $$props) pAns = $$props.pAns;
    		if ('pSols' in $$props) pSols = $$props.pSols;
    		if ('x' in $$props) x = $$props.x;
    		if ('y' in $$props) y = $$props.y;
    		if ('word' in $$props) word = $$props.word;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		board,
    		guesses,
    		rows,
    		context,
    		shake,
    		bounce,
    		hideCtx,
    		row_binding,
    		row_value_binding,
    		ctx_handler
    	];
    }

    class Board extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			value: 0,
    			board: 1,
    			guesses: 2,
    			shake: 5,
    			bounce: 6,
    			hideCtx: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Board",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<Board> was created without expected prop 'value'");
    		}

    		if (/*board*/ ctx[1] === undefined && !('board' in props)) {
    			console.warn("<Board> was created without expected prop 'board'");
    		}

    		if (/*guesses*/ ctx[2] === undefined && !('guesses' in props)) {
    			console.warn("<Board> was created without expected prop 'guesses'");
    		}
    	}

    	get value() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get board() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set board(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get guesses() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set guesses(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shake() {
    		return this.$$.ctx[5];
    	}

    	set shake(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bounce() {
    		return this.$$.ctx[6];
    	}

    	set bounce(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideCtx() {
    		return this.$$.ctx[7];
    	}

    	set hideCtx(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/keyboard/Key.svelte generated by Svelte v3.50.1 */
    const file$f = "src/components/keyboard/Key.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*letter*/ ctx[0]);
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*state*/ ctx[1]) + " svelte-1ymomqm"));
    			toggle_class(div, "big", /*letter*/ ctx[0].length !== 1);
    			add_location(div, file$f, 6, 0, 163);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*letter*/ 1) set_data_dev(t, /*letter*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*state*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(/*state*/ ctx[1]) + " svelte-1ymomqm"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*state, letter*/ 3) {
    				toggle_class(div, "big", /*letter*/ ctx[0].length !== 1);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Key', slots, ['default']);
    	let { letter } = $$props;
    	let { state = "🔳" } = $$props;
    	const dispatch = createEventDispatcher();
    	const writable_props = ['letter', 'state'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Key> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("keystroke", letter);

    	$$self.$$set = $$props => {
    		if ('letter' in $$props) $$invalidate(0, letter = $$props.letter);
    		if ('state' in $$props) $$invalidate(1, state = $$props.state);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		letter,
    		state,
    		dispatch
    	});

    	$$self.$inject_state = $$props => {
    		if ('letter' in $$props) $$invalidate(0, letter = $$props.letter);
    		if ('state' in $$props) $$invalidate(1, state = $$props.state);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [letter, state, dispatch, $$scope, slots, click_handler];
    }

    class Key extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { letter: 0, state: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Key",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*letter*/ ctx[0] === undefined && !('letter' in props)) {
    			console.warn("<Key> was created without expected prop 'letter'");
    		}
    	}

    	get letter() {
    		throw new Error("<Key>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set letter(value) {
    		throw new Error("<Key>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Key>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Key>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/keyboard/Keyboard.svelte generated by Svelte v3.50.1 */
    const file$e = "src/components/keyboard/Keyboard.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (50:2) {#each keys[0] as letter}
    function create_each_block_2(ctx) {
    	let key;
    	let current;

    	key = new Key({
    			props: {
    				letter: /*letter*/ ctx[13],
    				state: /*$letterStates*/ ctx[1][/*letter*/ ctx[13]]
    			},
    			$$inline: true
    		});

    	key.$on("keystroke", /*keystroke_handler*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(key.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(key, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const key_changes = {};
    			if (dirty & /*$letterStates*/ 2) key_changes.state = /*$letterStates*/ ctx[1][/*letter*/ ctx[13]];
    			key.$set(key_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(key, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(50:2) {#each keys[0] as letter}",
    		ctx
    	});

    	return block;
    }

    // (59:2) {#each keys[1] as letter}
    function create_each_block_1(ctx) {
    	let key;
    	let current;

    	key = new Key({
    			props: {
    				letter: /*letter*/ ctx[13],
    				state: /*$letterStates*/ ctx[1][/*letter*/ ctx[13]]
    			},
    			$$inline: true
    		});

    	key.$on("keystroke", /*keystroke_handler_1*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(key.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(key, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const key_changes = {};
    			if (dirty & /*$letterStates*/ 2) key_changes.state = /*$letterStates*/ ctx[1][/*letter*/ ctx[13]];
    			key.$set(key_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(key, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(59:2) {#each keys[1] as letter}",
    		ctx
    	});

    	return block;
    }

    // (69:2) {#each keys[2] as letter}
    function create_each_block$3(ctx) {
    	let key;
    	let current;

    	key = new Key({
    			props: {
    				letter: /*letter*/ ctx[13],
    				state: /*$letterStates*/ ctx[1][/*letter*/ ctx[13]]
    			},
    			$$inline: true
    		});

    	key.$on("keystroke", /*keystroke_handler_2*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(key.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(key, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const key_changes = {};
    			if (dirty & /*$letterStates*/ 2) key_changes.state = /*$letterStates*/ ctx[1][/*letter*/ ctx[13]];
    			key.$set(key_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(key, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(69:2) {#each keys[2] as letter}",
    		ctx
    	});

    	return block;
    }

    // (76:2) <Key letter="" on:keystroke={backspaceValue}>
    function create_default_slot$3(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z");
    			add_location(path, file$e, 77, 4, 2262);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-bldt10");
    			add_location(svg, file$e, 76, 3, 2197);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(76:2) <Key letter=\\\"\\\" on:keystroke={backspaceValue}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let t0;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let key0;
    	let t3;
    	let t4;
    	let key1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_2 = keys[0];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = keys[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	key0 = new Key({
    			props: { letter: "ENTER" },
    			$$inline: true
    		});

    	key0.$on("keystroke", /*enterPressed*/ ctx[4]);
    	let each_value = keys[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	key1 = new Key({
    			props: {
    				letter: "",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	key1.$on("keystroke", /*backspaceValue*/ ctx[3]);

    	const block = {
    		c: function create() {
    			t0 = space();
    			div3 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div2 = element("div");
    			create_component(key0.$$.fragment);
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			create_component(key1.$$.fragment);
    			attr_dev(div0, "class", "row svelte-bldt10");
    			add_location(div0, file$e, 48, 1, 1580);
    			attr_dev(div1, "class", "row svelte-bldt10");
    			add_location(div1, file$e, 57, 1, 1754);
    			attr_dev(div2, "class", "row svelte-bldt10");
    			add_location(div2, file$e, 66, 1, 1928);
    			attr_dev(div3, "class", "keyboard svelte-bldt10");
    			toggle_class(div3, "preventChange", /*preventChange*/ ctx[0]);
    			add_location(div3, file$e, 47, 0, 1536);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div3, t1);
    			append_dev(div3, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			mount_component(key0, div2, null);
    			append_dev(div2, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t4);
    			mount_component(key1, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(document.body, "keydown", /*handleKeystroke*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*keys, $letterStates, appendValue*/ 6) {
    				each_value_2 = keys[0];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*keys, $letterStates, appendValue*/ 6) {
    				each_value_1 = keys[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*keys, $letterStates, appendValue*/ 6) {
    				each_value = keys[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, t4);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}

    			const key1_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				key1_changes.$$scope = { dirty, ctx };
    			}

    			key1.$set(key1_changes);

    			if (!current || dirty & /*preventChange*/ 1) {
    				toggle_class(div3, "preventChange", /*preventChange*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(key0.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(key1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(key0.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(key1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_component(key0);
    			destroy_each(each_blocks, detaching);
    			destroy_component(key1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $server_response;
    	let $letterStates;
    	validate_store(server_response, 'server_response');
    	component_subscribe($$self, server_response, $$value => $$invalidate(10, $server_response = $$value));
    	validate_store(letterStates, 'letterStates');
    	component_subscribe($$self, letterStates, $$value => $$invalidate(1, $letterStates = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Keyboard', slots, []);
    	let { disabled = false } = $$props;
    	let preventChange = true;
    	const dispatch = createEventDispatcher();

    	function appendValue(char) {
    		dispatch("keystroke", char);
    		wordleKeyPressed(char).then(sr => set_store_value(server_response, $server_response = sr, $server_response));
    	}

    	function backspaceValue() {
    		deleteKeyPressed().then(sr => set_store_value(server_response, $server_response = sr, $server_response));
    	}

    	function enterPressed() {
    		checkGuess().then(sr => {
    			set_store_value(server_response, $server_response = sr, $server_response);
    			dispatch("submitWord");
    		});
    	}

    	function handleKeystroke(e) {
    		if (!disabled && !e.ctrlKey && !e.altKey) {
    			if (e.key && (/^[a-z]$/).test(e.key.toLowerCase())) {
    				return appendValue(e.key.toLowerCase());
    			}

    			if (e.key === "Backspace") return backspaceValue();
    			if (e.key === "Enter") return enterPressed();
    		}

    		if (e.key === "Escape") dispatch("esc");
    	}

    	// Ensure keys change on load instead of loading their state color & change the color of all the keys to neutral, then to their correct color on mode change
    	const unsub = mode.subscribe(() => {
    		$$invalidate(0, preventChange = true);
    		setTimeout(() => $$invalidate(0, preventChange = false), 200);
    	});

    	onDestroy(unsub);
    	const writable_props = ['disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Keyboard> was created with unknown prop '${key}'`);
    	});

    	const keystroke_handler = e => appendValue(e.detail);
    	const keystroke_handler_1 = e => appendValue(e.detail);
    	const keystroke_handler_2 = e => appendValue(e.detail);

    	$$self.$$set = $$props => {
    		if ('disabled' in $$props) $$invalidate(6, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		letterStates,
    		mode,
    		server_response,
    		COLS,
    		keys,
    		Key,
    		wordleKeyPressed,
    		checkGuess,
    		deleteKeyPressed,
    		disabled,
    		preventChange,
    		dispatch,
    		appendValue,
    		backspaceValue,
    		enterPressed,
    		handleKeystroke,
    		unsub,
    		$server_response,
    		$letterStates
    	});

    	$$self.$inject_state = $$props => {
    		if ('disabled' in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ('preventChange' in $$props) $$invalidate(0, preventChange = $$props.preventChange);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		preventChange,
    		$letterStates,
    		appendValue,
    		backspaceValue,
    		enterPressed,
    		handleKeystroke,
    		disabled,
    		keystroke_handler,
    		keystroke_handler_1,
    		keystroke_handler_2
    	];
    }

    class Keyboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { disabled: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get disabled() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Modal.svelte generated by Svelte v3.50.1 */
    const file$d = "src/components/Modal.svelte";
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});

    // (31:0) {:else}
    function create_else_block$1(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*closable*/ ctx[1] && create_if_block_2(ctx);
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "modal svelte-wqwz5h");
    			add_location(div0, file$d, 32, 2, 764);
    			attr_dev(div1, "class", "overlay svelte-wqwz5h");
    			toggle_class(div1, "visible", /*visible*/ ctx[0]);
    			add_location(div1, file$d, 31, 1, 704);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div0, t);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", self$1(/*close*/ ctx[3]), false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*closable*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*closable*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*visible*/ 1) {
    				toggle_class(div1, "visible", /*visible*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(31:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:0) {#if fullscreen}
    function create_if_block$4(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let current;
    	let if_block = /*closable*/ ctx[1] && create_if_block_1(ctx);
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	const footer_slot_template = /*#slots*/ ctx[4].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[5], get_footer_slot_context);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (footer_slot) footer_slot.c();
    			add_location(div0, file$d, 25, 2, 635);
    			attr_dev(div1, "class", "page svelte-wqwz5h");
    			toggle_class(div1, "visible", /*visible*/ ctx[0]);
    			add_location(div1, file$d, 15, 1, 364);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			append_dev(div1, t1);

    			if (footer_slot) {
    				footer_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*closable*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*closable*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t0);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			if (footer_slot) {
    				if (footer_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						footer_slot,
    						footer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[5], dirty, get_footer_slot_changes),
    						get_footer_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*visible*/ 1) {
    				toggle_class(div1, "visible", /*visible*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			transition_in(footer_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			transition_out(footer_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (footer_slot) footer_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(15:0) {#if fullscreen}",
    		ctx
    	});

    	return block;
    }

    // (34:3) {#if closable}
    function create_if_block_2(ctx) {
    	let div;
    	let gameicon;
    	let current;
    	let mounted;
    	let dispose;

    	gameicon = new GameIcon({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(gameicon.$$.fragment);
    			attr_dev(div, "class", "exit svelte-wqwz5h");
    			add_location(div, file$d, 34, 4, 806);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(gameicon, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*close*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const gameicon_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				gameicon_changes.$$scope = { dirty, ctx };
    			}

    			gameicon.$set(gameicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(gameicon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(34:3) {#if closable}",
    		ctx
    	});

    	return block;
    }

    // (36:5) <GameIcon>
    function create_default_slot_1$1(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    			add_location(path, file$d, 36, 6, 864);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(36:5) <GameIcon>",
    		ctx
    	});

    	return block;
    }

    // (17:2) {#if closable}
    function create_if_block_1(ctx) {
    	let div;
    	let gameicon;
    	let current;
    	let mounted;
    	let dispose;

    	gameicon = new GameIcon({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(gameicon.$$.fragment);
    			attr_dev(div, "class", "exit svelte-wqwz5h");
    			add_location(div, file$d, 17, 3, 417);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(gameicon, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*close*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const gameicon_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				gameicon_changes.$$scope = { dirty, ctx };
    			}

    			gameicon.$set(gameicon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gameicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gameicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(gameicon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(17:2) {#if closable}",
    		ctx
    	});

    	return block;
    }

    // (19:4) <GameIcon>
    function create_default_slot$2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    			add_location(path, file$d, 19, 5, 473);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(19:4) <GameIcon>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*fullscreen*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['default','footer']);
    	let { visible = false } = $$props;
    	let { closable = true } = $$props;
    	let { fullscreen = false } = $$props;
    	const dispach = createEventDispatcher();

    	function close() {
    		if (!closable) return;
    		$$invalidate(0, visible = false);
    		dispach("close");
    	}

    	const writable_props = ['visible', 'closable', 'fullscreen'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    		if ('closable' in $$props) $$invalidate(1, closable = $$props.closable);
    		if ('fullscreen' in $$props) $$invalidate(2, fullscreen = $$props.fullscreen);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		GameIcon,
    		visible,
    		closable,
    		fullscreen,
    		dispach,
    		close
    	});

    	$$self.$inject_state = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    		if ('closable' in $$props) $$invalidate(1, closable = $$props.closable);
    		if ('fullscreen' in $$props) $$invalidate(2, fullscreen = $$props.fullscreen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, closable, fullscreen, close, slots, $$scope];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { visible: 0, closable: 1, fullscreen: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get visible() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closable() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closable(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullscreen() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullscreen(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/settings/Setting.svelte generated by Svelte v3.50.1 */

    const file$c = "src/components/settings/Setting.svelte";
    const get_value_slot_changes = dirty => ({});
    const get_value_slot_context = ctx => ({});
    const get_desc_slot_changes = dirty => ({});
    const get_desc_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});

    function create_fragment$d(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[1].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[0], get_title_slot_context);
    	const desc_slot_template = /*#slots*/ ctx[1].desc;
    	const desc_slot = create_slot(desc_slot_template, ctx, /*$$scope*/ ctx[0], get_desc_slot_context);
    	const value_slot_template = /*#slots*/ ctx[1].value;
    	const value_slot = create_slot(value_slot_template, ctx, /*$$scope*/ ctx[0], get_value_slot_context);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			if (title_slot) title_slot.c();
    			t0 = space();
    			div1 = element("div");
    			if (desc_slot) desc_slot.c();
    			t1 = space();
    			if (value_slot) value_slot.c();
    			attr_dev(div0, "class", "title svelte-47hkz0");
    			add_location(div0, file$c, 2, 2, 31);
    			attr_dev(div1, "class", "desc svelte-47hkz0");
    			add_location(div1, file$c, 3, 2, 80);
    			add_location(div2, file$c, 1, 1, 23);
    			attr_dev(div3, "class", "setting svelte-47hkz0");
    			add_location(div3, file$c, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (title_slot) {
    				title_slot.m(div0, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);

    			if (desc_slot) {
    				desc_slot.m(div1, null);
    			}

    			append_dev(div3, t1);

    			if (value_slot) {
    				value_slot.m(div3, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (title_slot) {
    				if (title_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						title_slot,
    						title_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(title_slot_template, /*$$scope*/ ctx[0], dirty, get_title_slot_changes),
    						get_title_slot_context
    					);
    				}
    			}

    			if (desc_slot) {
    				if (desc_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						desc_slot,
    						desc_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(desc_slot_template, /*$$scope*/ ctx[0], dirty, get_desc_slot_changes),
    						get_desc_slot_context
    					);
    				}
    			}

    			if (value_slot) {
    				if (value_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						value_slot,
    						value_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(value_slot_template, /*$$scope*/ ctx[0], dirty, get_value_slot_changes),
    						get_value_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			transition_in(desc_slot, local);
    			transition_in(value_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			transition_out(desc_slot, local);
    			transition_out(value_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (title_slot) title_slot.d(detaching);
    			if (desc_slot) desc_slot.d(detaching);
    			if (value_slot) value_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Setting', slots, ['title','desc','value']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Setting> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Setting extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Setting",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/settings/Switch.svelte generated by Svelte v3.50.1 */

    const file$b = "src/components/settings/Switch.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "disabled", /*disabled*/ ctx[1]);
    			attr_dev(div, "class", "svelte-16o9p8g");
    			toggle_class(div, "checked", /*value*/ ctx[0]);
    			add_location(div, file$b, 4, 0, 76);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*disabled*/ 2) {
    				attr_dev(div, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 1) {
    				toggle_class(div, "checked", /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Switch', slots, []);
    	let { value } = $$props;
    	let { disabled = false } = $$props;
    	const writable_props = ['value', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => !disabled && $$invalidate(0, value = !value);

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ value, disabled });

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, disabled, click_handler];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { value: 0, disabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<Switch> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/settings/Button.svelte generated by Svelte v3.50.1 */

    const file$a = "src/components/settings/Button.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[1]);
    			attr_dev(div, "disabled", /*disabled*/ ctx[2]);
    			attr_dev(div, "class", "svelte-40dzhl");
    			add_location(div, file$a, 5, 0, 116);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"click",
    					function () {
    						if (is_function(/*click*/ ctx[0])) /*click*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);

    			if (dirty & /*disabled*/ 4) {
    				attr_dev(div, "disabled", /*disabled*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);

    	let { click = () => {
    		
    	} } = $$props;

    	let { text = "Button" } = $$props;
    	let { disabled = false } = $$props;
    	const writable_props = ['click', 'text', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('click' in $$props) $$invalidate(0, click = $$props.click);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ click, text, disabled });

    	$$self.$inject_state = $$props => {
    		if ('click' in $$props) $$invalidate(0, click = $$props.click);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [click, text, disabled];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { click: 0, text: 1, disabled: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get click() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set click(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/settings/Settings.svelte generated by Svelte v3.50.1 */
    const file$9 = "src/components/settings/Settings.svelte";

    // (24:3) 
    function create_title_slot_1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Dark Mode";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$9, 23, 3, 696);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot_1.name,
    		type: "slot",
    		source: "(24:3) ",
    		ctx
    	});

    	return block;
    }

    // (25:3) 
    function create_value_slot_1(ctx) {
    	let span;
    	let switch_1;
    	let updating_value;
    	let current;

    	function switch_1_value_binding(value) {
    		/*switch_1_value_binding*/ ctx[2](value);
    	}

    	let switch_1_props = {};

    	if (/*$settings*/ ctx[0].dark !== void 0) {
    		switch_1_props.value = /*$settings*/ ctx[0].dark;
    	}

    	switch_1 = new Switch({ props: switch_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch_1, 'value', switch_1_value_binding));

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(switch_1.$$.fragment);
    			attr_dev(span, "slot", "value");
    			add_location(span, file$9, 24, 3, 735);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(switch_1, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_1_changes = {};

    			if (!updating_value && dirty & /*$settings*/ 1) {
    				updating_value = true;
    				switch_1_changes.value = /*$settings*/ ctx[0].dark;
    				add_flush_callback(() => updating_value = false);
    			}

    			switch_1.$set(switch_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(switch_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_value_slot_1.name,
    		type: "slot",
    		source: "(25:3) ",
    		ctx
    	});

    	return block;
    }

    // (28:3) 
    function create_title_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Backend URL";
    			attr_dev(span, "slot", "title");
    			add_location(span, file$9, 27, 3, 828);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(28:3) ",
    		ctx
    	});

    	return block;
    }

    // (29:3) 
    function create_value_slot(ctx) {
    	let span;
    	let button;
    	let current;

    	button = new Button({
    			props: { text: "Change", click: /*func*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(button.$$.fragment);
    			attr_dev(span, "slot", "value");
    			add_location(span, file$9, 28, 3, 869);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(button, span, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_value_slot.name,
    		type: "slot",
    		source: "(29:3) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div1;
    	let div0;
    	let h3;
    	let t1;
    	let setting0;
    	let t2;
    	let setting1;
    	let current;

    	setting0 = new Setting({
    			props: {
    				$$slots: {
    					value: [create_value_slot_1],
    					title: [create_title_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	setting1 = new Setting({
    			props: {
    				$$slots: {
    					value: [create_value_slot],
    					title: [create_title_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "settings";
    			t1 = space();
    			create_component(setting0.$$.fragment);
    			t2 = space();
    			create_component(setting1.$$.fragment);
    			attr_dev(h3, "class", "svelte-x85lhb");
    			add_location(h3, file$9, 21, 2, 663);
    			attr_dev(div0, "class", "settings-top svelte-x85lhb");
    			add_location(div0, file$9, 20, 1, 634);
    			attr_dev(div1, "class", "outer svelte-x85lhb");
    			add_location(div1, file$9, 19, 0, 613);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			mount_component(setting0, div0, null);
    			append_dev(div0, t2);
    			mount_component(setting1, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const setting0_changes = {};

    			if (dirty & /*$$scope, $settings*/ 17) {
    				setting0_changes.$$scope = { dirty, ctx };
    			}

    			setting0.$set(setting0_changes);
    			const setting1_changes = {};

    			if (dirty & /*$$scope*/ 16) {
    				setting1_changes.$$scope = { dirty, ctx };
    			}

    			setting1.$set(setting1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(setting0.$$.fragment, local);
    			transition_in(setting1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(setting0.$$.fragment, local);
    			transition_out(setting1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(setting0);
    			destroy_component(setting1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $settings;
    	validate_store(settings, 'settings');
    	component_subscribe($$self, settings, $$value => $$invalidate(0, $settings = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Settings', slots, []);
    	let root;

    	onMount(() => {
    		$$invalidate(1, root = document.documentElement);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	function switch_1_value_binding(value) {
    		if ($$self.$$.not_equal($settings.dark, value)) {
    			$settings.dark = value;
    			settings.set($settings);
    		}
    	}

    	const func = () => backendURL.set("localstorage");

    	$$self.$capture_state = () => ({
    		onMount,
    		settings,
    		backendURL,
    		Setting,
    		Switch,
    		Button,
    		root,
    		$settings
    	});

    	$$self.$inject_state = $$props => {
    		if ('root' in $$props) $$invalidate(1, root = $$props.root);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*root, $settings*/ 3) {
    			{
    				if (root) {
    					$settings.dark
    					? root.classList.remove("light")
    					: root.classList.add("light");

    					localStorage.setItem("settings", JSON.stringify($settings));
    				}
    			}
    		}
    	};

    	return [$settings, root, switch_1_value_binding, func];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/widgets/Seperator.svelte generated by Svelte v3.50.1 */

    const file$8 = "src/components/widgets/Seperator.svelte";
    const get__2_slot_changes = dirty => ({});
    const get__2_slot_context = ctx => ({});
    const get__1_slot_changes = dirty => ({});
    const get__1_slot_context = ctx => ({});

    function create_fragment$9(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let current;
    	const _1_slot_template = /*#slots*/ ctx[2]["1"];
    	const _1_slot = create_slot(_1_slot_template, ctx, /*$$scope*/ ctx[1], get__1_slot_context);
    	const _2_slot_template = /*#slots*/ ctx[2]["2"];
    	const _2_slot = create_slot(_2_slot_template, ctx, /*$$scope*/ ctx[1], get__2_slot_context);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (_1_slot) _1_slot.c();
    			t = space();
    			div1 = element("div");
    			if (_2_slot) _2_slot.c();
    			attr_dev(div0, "class", "svelte-1cu43ge");
    			add_location(div0, file$8, 4, 1, 89);
    			attr_dev(div1, "class", "svelte-1cu43ge");
    			add_location(div1, file$8, 7, 1, 124);
    			attr_dev(div2, "class", "sep svelte-1cu43ge");
    			toggle_class(div2, "visible", /*visible*/ ctx[0]);
    			add_location(div2, file$8, 3, 0, 56);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			if (_1_slot) {
    				_1_slot.m(div0, null);
    			}

    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (_2_slot) {
    				_2_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (_1_slot) {
    				if (_1_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						_1_slot,
    						_1_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(_1_slot_template, /*$$scope*/ ctx[1], dirty, get__1_slot_changes),
    						get__1_slot_context
    					);
    				}
    			}

    			if (_2_slot) {
    				if (_2_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						_2_slot,
    						_2_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(_2_slot_template, /*$$scope*/ ctx[1], dirty, get__2_slot_changes),
    						get__2_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*visible*/ 1) {
    				toggle_class(div2, "visible", /*visible*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(_1_slot, local);
    			transition_in(_2_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(_1_slot, local);
    			transition_out(_2_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (_1_slot) _1_slot.d(detaching);
    			if (_2_slot) _2_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Seperator', slots, ['1','2']);
    	let { visible = true } = $$props;
    	const writable_props = ['visible'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Seperator> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ visible });

    	$$self.$inject_state = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible, $$scope, slots];
    }

    class Seperator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { visible: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Seperator",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get visible() {
    		throw new Error("<Seperator>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Seperator>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/widgets/Tutorial.svelte generated by Svelte v3.50.1 */
    const file$7 = "src/components/widgets/Tutorial.svelte";

    function create_fragment$8(ctx) {
    	let h3;
    	let t1;
    	let div0;
    	let t2;
    	let strong0;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let div1;
    	let t11;
    	let div2;
    	let t13;
    	let div10;
    	let div3;
    	let strong1;
    	let t15;
    	let div4;
    	let tile0;
    	let t16;
    	let tile1;
    	let t17;
    	let tile2;
    	let t18;
    	let tile3;
    	let t19;
    	let tile4;
    	let t20;
    	let div5;
    	let t21;
    	let strong2;
    	let t23;
    	let t24;
    	let div6;
    	let tile5;
    	let t25;
    	let tile6;
    	let t26;
    	let tile7;
    	let t27;
    	let tile8;
    	let t28;
    	let tile9;
    	let t29;
    	let div7;
    	let t30;
    	let strong3;
    	let t32;
    	let t33;
    	let div8;
    	let tile10;
    	let t34;
    	let tile11;
    	let t35;
    	let tile12;
    	let t36;
    	let tile13;
    	let t37;
    	let tile14;
    	let t38;
    	let div9;
    	let t39;
    	let strong4;
    	let t41;
    	let current;

    	tile0 = new Tile({
    			props: { value: "t", state: "🟩" },
    			$$inline: true
    		});

    	tile1 = new Tile({
    			props: { value: "u", state: "🔳" },
    			$$inline: true
    		});

    	tile2 = new Tile({
    			props: { value: "f", state: "🔳" },
    			$$inline: true
    		});

    	tile3 = new Tile({
    			props: { value: "f", state: "🔳" },
    			$$inline: true
    		});

    	tile4 = new Tile({
    			props: { value: "y", state: "🔳" },
    			$$inline: true
    		});

    	tile5 = new Tile({
    			props: { value: "t", state: "🔳" },
    			$$inline: true
    		});

    	tile6 = new Tile({
    			props: { value: "i", state: "🟨" },
    			$$inline: true
    		});

    	tile7 = new Tile({
    			props: { value: "t", state: "🔳" },
    			$$inline: true
    		});

    	tile8 = new Tile({
    			props: { value: "a", state: "🔳" },
    			$$inline: true
    		});

    	tile9 = new Tile({
    			props: { value: "n", state: "🔳" },
    			$$inline: true
    		});

    	tile10 = new Tile({
    			props: { value: "h", state: "🔳" },
    			$$inline: true
    		});

    	tile11 = new Tile({
    			props: { value: "o", state: "🔳" },
    			$$inline: true
    		});

    	tile12 = new Tile({
    			props: { value: "l", state: "🔳" },
    			$$inline: true
    		});

    	tile13 = new Tile({
    			props: { value: "l", state: "🔳" },
    			$$inline: true
    		});

    	tile14 = new Tile({
    			props: { value: "y", state: "⬛" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "how to play";
    			t1 = space();
    			div0 = element("div");
    			t2 = text("Guess the ");
    			strong0 = element("strong");
    			strong0.textContent = "TUFFLE";
    			t4 = text(" in ");
    			t5 = text(ROWS);
    			t6 = text(" tries.");
    			t7 = space();
    			div1 = element("div");
    			div1.textContent = `Each guess must be a valid ${COLS} letter word. Hit the enter button to submit.`;
    			t11 = space();
    			div2 = element("div");
    			div2.textContent = "After each guess, the color of the tiles will change to show how close your guess was to the\n\tword.";
    			t13 = space();
    			div10 = element("div");
    			div3 = element("div");
    			strong1 = element("strong");
    			strong1.textContent = "Examples";
    			t15 = space();
    			div4 = element("div");
    			create_component(tile0.$$.fragment);
    			t16 = space();
    			create_component(tile1.$$.fragment);
    			t17 = space();
    			create_component(tile2.$$.fragment);
    			t18 = space();
    			create_component(tile3.$$.fragment);
    			t19 = space();
    			create_component(tile4.$$.fragment);
    			t20 = space();
    			div5 = element("div");
    			t21 = text("The letter ");
    			strong2 = element("strong");
    			strong2.textContent = "T";
    			t23 = text(" is in the word and in the correct spot.");
    			t24 = space();
    			div6 = element("div");
    			create_component(tile5.$$.fragment);
    			t25 = space();
    			create_component(tile6.$$.fragment);
    			t26 = space();
    			create_component(tile7.$$.fragment);
    			t27 = space();
    			create_component(tile8.$$.fragment);
    			t28 = space();
    			create_component(tile9.$$.fragment);
    			t29 = space();
    			div7 = element("div");
    			t30 = text("The letter ");
    			strong3 = element("strong");
    			strong3.textContent = "I";
    			t32 = text(" is in the word but in the wrong spot.");
    			t33 = space();
    			div8 = element("div");
    			create_component(tile10.$$.fragment);
    			t34 = space();
    			create_component(tile11.$$.fragment);
    			t35 = space();
    			create_component(tile12.$$.fragment);
    			t36 = space();
    			create_component(tile13.$$.fragment);
    			t37 = space();
    			create_component(tile14.$$.fragment);
    			t38 = space();
    			div9 = element("div");
    			t39 = text("The letter ");
    			strong4 = element("strong");
    			strong4.textContent = "Y";
    			t41 = text(" is not in the word in any spot.");
    			add_location(h3, file$7, 5, 0, 124);
    			add_location(strong0, file$7, 6, 15, 160);
    			attr_dev(div0, "class", "svelte-6daei");
    			add_location(div0, file$7, 6, 0, 145);
    			attr_dev(div1, "class", "svelte-6daei");
    			add_location(div1, file$7, 7, 0, 207);
    			attr_dev(div2, "class", "svelte-6daei");
    			add_location(div2, file$7, 8, 0, 297);
    			add_location(strong1, file$7, 13, 6, 465);
    			attr_dev(div3, "class", "svelte-6daei");
    			add_location(div3, file$7, 13, 1, 460);
    			attr_dev(div4, "class", "row svelte-6daei");
    			add_location(div4, file$7, 14, 1, 498);
    			add_location(strong2, file$7, 21, 17, 701);
    			attr_dev(div5, "class", "svelte-6daei");
    			add_location(div5, file$7, 21, 1, 685);
    			attr_dev(div6, "class", "row svelte-6daei");
    			add_location(div6, file$7, 22, 1, 767);
    			add_location(strong3, file$7, 29, 17, 970);
    			attr_dev(div7, "class", "svelte-6daei");
    			add_location(div7, file$7, 29, 1, 954);
    			attr_dev(div8, "class", "row svelte-6daei");
    			add_location(div8, file$7, 30, 1, 1034);
    			add_location(strong4, file$7, 37, 17, 1236);
    			attr_dev(div9, "class", "svelte-6daei");
    			add_location(div9, file$7, 37, 1, 1220);
    			attr_dev(div10, "class", "examples svelte-6daei");
    			toggle_class(div10, "complete", /*visible*/ ctx[0]);
    			add_location(div10, file$7, 12, 0, 411);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t2);
    			append_dev(div0, strong0);
    			append_dev(div0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div3);
    			append_dev(div3, strong1);
    			append_dev(div10, t15);
    			append_dev(div10, div4);
    			mount_component(tile0, div4, null);
    			append_dev(div4, t16);
    			mount_component(tile1, div4, null);
    			append_dev(div4, t17);
    			mount_component(tile2, div4, null);
    			append_dev(div4, t18);
    			mount_component(tile3, div4, null);
    			append_dev(div4, t19);
    			mount_component(tile4, div4, null);
    			append_dev(div10, t20);
    			append_dev(div10, div5);
    			append_dev(div5, t21);
    			append_dev(div5, strong2);
    			append_dev(div5, t23);
    			append_dev(div10, t24);
    			append_dev(div10, div6);
    			mount_component(tile5, div6, null);
    			append_dev(div6, t25);
    			mount_component(tile6, div6, null);
    			append_dev(div6, t26);
    			mount_component(tile7, div6, null);
    			append_dev(div6, t27);
    			mount_component(tile8, div6, null);
    			append_dev(div6, t28);
    			mount_component(tile9, div6, null);
    			append_dev(div10, t29);
    			append_dev(div10, div7);
    			append_dev(div7, t30);
    			append_dev(div7, strong3);
    			append_dev(div7, t32);
    			append_dev(div10, t33);
    			append_dev(div10, div8);
    			mount_component(tile10, div8, null);
    			append_dev(div8, t34);
    			mount_component(tile11, div8, null);
    			append_dev(div8, t35);
    			mount_component(tile12, div8, null);
    			append_dev(div8, t36);
    			mount_component(tile13, div8, null);
    			append_dev(div8, t37);
    			mount_component(tile14, div8, null);
    			append_dev(div10, t38);
    			append_dev(div10, div9);
    			append_dev(div9, t39);
    			append_dev(div9, strong4);
    			append_dev(div9, t41);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*visible*/ 1) {
    				toggle_class(div10, "complete", /*visible*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tile0.$$.fragment, local);
    			transition_in(tile1.$$.fragment, local);
    			transition_in(tile2.$$.fragment, local);
    			transition_in(tile3.$$.fragment, local);
    			transition_in(tile4.$$.fragment, local);
    			transition_in(tile5.$$.fragment, local);
    			transition_in(tile6.$$.fragment, local);
    			transition_in(tile7.$$.fragment, local);
    			transition_in(tile8.$$.fragment, local);
    			transition_in(tile9.$$.fragment, local);
    			transition_in(tile10.$$.fragment, local);
    			transition_in(tile11.$$.fragment, local);
    			transition_in(tile12.$$.fragment, local);
    			transition_in(tile13.$$.fragment, local);
    			transition_in(tile14.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tile0.$$.fragment, local);
    			transition_out(tile1.$$.fragment, local);
    			transition_out(tile2.$$.fragment, local);
    			transition_out(tile3.$$.fragment, local);
    			transition_out(tile4.$$.fragment, local);
    			transition_out(tile5.$$.fragment, local);
    			transition_out(tile6.$$.fragment, local);
    			transition_out(tile7.$$.fragment, local);
    			transition_out(tile8.$$.fragment, local);
    			transition_out(tile9.$$.fragment, local);
    			transition_out(tile10.$$.fragment, local);
    			transition_out(tile11.$$.fragment, local);
    			transition_out(tile12.$$.fragment, local);
    			transition_out(tile13.$$.fragment, local);
    			transition_out(tile14.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div10);
    			destroy_component(tile0);
    			destroy_component(tile1);
    			destroy_component(tile2);
    			destroy_component(tile3);
    			destroy_component(tile4);
    			destroy_component(tile5);
    			destroy_component(tile6);
    			destroy_component(tile7);
    			destroy_component(tile8);
    			destroy_component(tile9);
    			destroy_component(tile10);
    			destroy_component(tile11);
    			destroy_component(tile12);
    			destroy_component(tile13);
    			destroy_component(tile14);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tutorial', slots, []);
    	let { visible } = $$props;
    	const writable_props = ['visible'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tutorial> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	$$self.$capture_state = () => ({ COLS, ROWS, Tile, visible });

    	$$self.$inject_state = $$props => {
    		if ('visible' in $$props) $$invalidate(0, visible = $$props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [visible];
    }

    class Tutorial extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { visible: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tutorial",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*visible*/ ctx[0] === undefined && !('visible' in props)) {
    			console.warn("<Tutorial> was created without expected prop 'visible'");
    		}
    	}

    	get visible() {
    		throw new Error("<Tutorial>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Tutorial>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/widgets/Timer.svelte generated by Svelte v3.50.1 */
    const file$6 = "src/components/widgets/Timer.svelte";

    // (32:1) {:else}
    function create_else_block(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M4.609 12c0-4.082 3.309-7.391 7.391-7.391a7.39 7.39 0 0 1 6.523 3.912l-1.653 1.567H22v-5.13l-1.572 1.659C18.652 3.841 15.542 2 12 2 6.477 2 2 6.477 2 12s4.477 10 10 10c4.589 0 8.453-3.09 9.631-7.301l-2.512-.703c-.871 3.113-3.73 5.395-7.119 5.395-4.082 0-7.391-3.309-7.391-7.391z");
    			add_location(path, file$6, 34, 4, 1063);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-1pg4aff");
    			add_location(svg, file$6, 33, 3, 998);
    			attr_dev(div, "class", "button svelte-1pg4aff");
    			add_location(div, file$6, 32, 2, 938);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(32:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (26:1) {#if ms > 0}
    function create_if_block$3(ctx) {
    	let div;
    	let t0_value = `${Math.floor(/*ms*/ ctx[0] / ms.HOUR)}`.padStart(2, "0") + "";
    	let t0;
    	let t1;
    	let t2_value = `${Math.floor(/*ms*/ ctx[0] % ms.HOUR / ms.MINUTE)}`.padStart(2, "0") + "";
    	let t2;
    	let t3;
    	let t4_value = `${Math.floor(/*ms*/ ctx[0] % ms.MINUTE / ms.SECOND)}`.padStart(2, "0") + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = text(t2_value);
    			t3 = text(":");
    			t4 = text(t4_value);
    			attr_dev(div, "class", "timer svelte-1pg4aff");
    			add_location(div, file$6, 26, 2, 709);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ms*/ 1 && t0_value !== (t0_value = `${Math.floor(/*ms*/ ctx[0] / ms.HOUR)}`.padStart(2, "0") + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*ms*/ 1 && t2_value !== (t2_value = `${Math.floor(/*ms*/ ctx[0] % ms.HOUR / ms.MINUTE)}`.padStart(2, "0") + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*ms*/ 1 && t4_value !== (t4_value = `${Math.floor(/*ms*/ ctx[0] % ms.MINUTE / ms.SECOND)}`.padStart(2, "0") + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(26:1) {#if ms > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let h3;
    	let t1;
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*ms*/ ctx[0] > 0) return create_if_block$3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Next Tuffle";
    			t1 = space();
    			div = element("div");
    			if_block.c();
    			attr_dev(h3, "class", "svelte-1pg4aff");
    			add_location(h3, file$6, 23, 0, 648);
    			attr_dev(div, "class", "container svelte-1pg4aff");
    			add_location(div, file$6, 24, 0, 669);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $mode;
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(3, $mode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Timer', slots, []);
    	const dispatch = createEventDispatcher();
    	let ms$1 = 1000;
    	let countDown;

    	function reset(m) {
    		clearInterval(countDown);
    		$$invalidate(0, ms$1 = timeRemaining(modeData.modes[m]));
    		if (ms$1 < 0) dispatch("timeup");

    		countDown = setInterval(
    			() => {
    				$$invalidate(0, ms$1 = timeRemaining(modeData.modes[m]));

    				if (ms$1 < 0) {
    					clearInterval(countDown);
    					dispatch("timeup");
    				}
    			},
    			ms.SECOND
    		);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Timer> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("reload");

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		MS: ms,
    		mode,
    		modeData,
    		timeRemaining,
    		dispatch,
    		ms: ms$1,
    		countDown,
    		reset,
    		$mode
    	});

    	$$self.$inject_state = $$props => {
    		if ('ms' in $$props) $$invalidate(0, ms$1 = $$props.ms);
    		if ('countDown' in $$props) countDown = $$props.countDown;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$mode*/ 8) {
    			reset($mode);
    		}
    	};

    	return [ms$1, dispatch, reset, $mode, click_handler];
    }

    class Timer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { reset: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timer",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get reset() {
    		return this.$$.ctx[2];
    	}

    	set reset(value) {
    		throw new Error("<Timer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/widgets/Toaster.svelte generated by Svelte v3.50.1 */
    const file$5 = "src/components/widgets/Toaster.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (10:1) {#each toast as slice}
    function create_each_block$2(ctx) {
    	let div;
    	let t_value = /*slice*/ ctx[2] + "";
    	let t;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "slice svelte-1dgg1bc");
    			add_location(div, file$5, 10, 2, 290);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*toast*/ 1) && t_value !== (t_value = /*slice*/ ctx[2] + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div_outro = create_out_transition(div, fade, { duration: 200 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(10:1) {#each toast as slice}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let current;
    	let each_value = /*toast*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "toast svelte-1dgg1bc");
    			add_location(div, file$5, 8, 0, 244);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toast*/ 1) {
    				each_value = /*toast*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Toaster', slots, []);

    	function pop(text, duration = 1) {
    		$$invalidate(0, toast = [text, ...toast]);
    		setTimeout(() => $$invalidate(0, toast = toast.slice(0, toast.length - 1)), duration * 1000);
    	}

    	let toast = [];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toaster> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fade, pop, toast });

    	$$self.$inject_state = $$props => {
    		if ('toast' in $$props) $$invalidate(0, toast = $$props.toast);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [toast, pop];
    }

    class Toaster extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { pop: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toaster",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get pop() {
    		return this.$$.ctx[1];
    	}

    	set pop(value) {
    		throw new Error("<Toaster>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/widgets/stats/Stat.svelte generated by Svelte v3.50.1 */

    const file$4 = "src/components/widgets/stats/Stat.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			t0 = text(/*stat*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*name*/ ctx[1]);
    			attr_dev(div0, "class", "stat svelte-dvu5v6");
    			add_location(div0, file$4, 5, 1, 74);
    			attr_dev(div1, "class", "name svelte-dvu5v6");
    			add_location(div1, file$4, 6, 1, 106);
    			attr_dev(section, "class", "svelte-dvu5v6");
    			add_location(section, file$4, 4, 0, 63);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, t0);
    			append_dev(section, t1);
    			append_dev(section, div1);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*stat*/ 1) set_data_dev(t0, /*stat*/ ctx[0]);
    			if (dirty & /*name*/ 2) set_data_dev(t2, /*name*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Stat', slots, []);
    	let { stat } = $$props;
    	let { name } = $$props;
    	const writable_props = ['stat', 'name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Stat> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('stat' in $$props) $$invalidate(0, stat = $$props.stat);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ stat, name });

    	$$self.$inject_state = $$props => {
    		if ('stat' in $$props) $$invalidate(0, stat = $$props.stat);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [stat, name];
    }

    class Stat extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { stat: 0, name: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stat",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*stat*/ ctx[0] === undefined && !('stat' in props)) {
    			console.warn("<Stat> was created without expected prop 'stat'");
    		}

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<Stat> was created without expected prop 'name'");
    		}
    	}

    	get stat() {
    		throw new Error("<Stat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stat(value) {
    		throw new Error("<Stat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Stat>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Stat>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/widgets/stats/Statistics.svelte generated by Svelte v3.50.1 */
    const file$3 = "src/components/widgets/stats/Statistics.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (22:1) {#each stats as stat}
    function create_each_block$1(ctx) {
    	let stat;
    	let current;

    	stat = new Stat({
    			props: {
    				name: /*stat*/ ctx[2][0],
    				stat: /*stat*/ ctx[2][1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(stat.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(stat, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const stat_changes = {};
    			if (dirty & /*stats*/ 1) stat_changes.name = /*stat*/ ctx[2][0];
    			if (dirty & /*stats*/ 1) stat_changes.stat = /*stat*/ ctx[2][1];
    			stat.$set(stat_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stat.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stat.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(stat, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(22:1) {#each stats as stat}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let h3;
    	let t1;
    	let div;
    	let current;
    	let each_value = /*stats*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Statistics";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h3, file$3, 19, 0, 515);
    			attr_dev(div, "class", "svelte-ljn64v");
    			add_location(div, file$3, 20, 0, 535);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*stats*/ 1) {
    				each_value = /*stats*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Statistics', slots, []);
    	let { data } = $$props;
    	let stats;
    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Statistics> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ modeData, Stat, data, stats });

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    		if ('stats' in $$props) $$invalidate(0, stats = $$props.stats);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, stats*/ 3) {
    			{
    				$$invalidate(0, stats = [
    					["Played", data.played],
    					[
    						"Win %",
    						Math.round((data.played - data.guesses.fail) / data.played * 100) || 0
    					]
    				]);

    				if (data.guesses.fail > 0) {
    					stats.push(["Lost", data.guesses.fail]);
    				}

    				if ("streak" in data) {
    					stats.push(["Current Streak", data.streak]);
    					stats.push(["Max Streak", data.maxStreak]);
    				}
    			}
    		}
    	};

    	return [stats, data];
    }

    class Statistics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { data: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Statistics",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[1] === undefined && !('data' in props)) {
    			console.warn("<Statistics> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Statistics>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Statistics>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/widgets/stats/Distribution.svelte generated by Svelte v3.50.1 */

    const { Object: Object_1 } = globals;
    const file$2 = "src/components/widgets/stats/Distribution.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[6] = i;
    	const constants_0 = Number(/*guess*/ child_ctx[3][0]);
    	child_ctx[4] = constants_0;
    	return child_ctx;
    }

    // (15:2) {#if !isNaN(g)}
    function create_if_block$2(ctx) {
    	let div1;
    	let span;
    	let t0_value = /*guess*/ ctx[3][0] + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2_value = /*guess*/ ctx[3][1] + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(span, "class", "guess svelte-1pserw8");
    			add_location(span, file$2, 16, 4, 444);
    			attr_dev(div0, "class", "bar svelte-1pserw8");
    			set_style(div0, "width", /*guess*/ ctx[3][1] / /*max*/ ctx[2] * 100 + "%");
    			toggle_class(div0, "this", /*g*/ ctx[4] === /*game*/ ctx[0].guesses && !/*game*/ ctx[0].active && !failed(/*game*/ ctx[0]));
    			add_location(div0, file$2, 17, 4, 486);
    			attr_dev(div1, "class", "graph svelte-1pserw8");
    			add_location(div1, file$2, 15, 3, 420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(span, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*distribution*/ 2 && t0_value !== (t0_value = /*guess*/ ctx[3][0] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*distribution*/ 2 && t2_value !== (t2_value = /*guess*/ ctx[3][1] + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*distribution, max*/ 6) {
    				set_style(div0, "width", /*guess*/ ctx[3][1] / /*max*/ ctx[2] * 100 + "%");
    			}

    			if (dirty & /*Number, Object, distribution, game, failed*/ 3) {
    				toggle_class(div0, "this", /*g*/ ctx[4] === /*game*/ ctx[0].guesses && !/*game*/ ctx[0].active && !failed(/*game*/ ctx[0]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(15:2) {#if !isNaN(g)}",
    		ctx
    	});

    	return block;
    }

    // (13:1) {#each Object.entries(distribution) as guess, i (guess[0])}
    function create_each_block(key_1, ctx) {
    	let first;
    	let show_if = !isNaN(/*g*/ ctx[4]);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block$2(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*distribution*/ 2) show_if = !isNaN(/*g*/ ctx[4]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(13:1) {#each Object.entries(distribution) as guess, i (guess[0])}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let h3;
    	let t1;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = Object.entries(/*distribution*/ ctx[1]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*guess*/ ctx[3][0];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "guess distribution";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h3, file$2, 10, 0, 254);
    			attr_dev(div, "class", "container svelte-1pserw8");
    			add_location(div, file$2, 11, 0, 282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, distribution, max, Number, game, failed, isNaN*/ 7) {
    				each_value = Object.entries(/*distribution*/ ctx[1]);
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let max;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Distribution', slots, []);
    	let { game } = $$props;
    	let { distribution } = $$props;
    	const writable_props = ['game', 'distribution'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Distribution> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('game' in $$props) $$invalidate(0, game = $$props.game);
    		if ('distribution' in $$props) $$invalidate(1, distribution = $$props.distribution);
    	};

    	$$self.$capture_state = () => ({ failed, game, distribution, max });

    	$$self.$inject_state = $$props => {
    		if ('game' in $$props) $$invalidate(0, game = $$props.game);
    		if ('distribution' in $$props) $$invalidate(1, distribution = $$props.distribution);
    		if ('max' in $$props) $$invalidate(2, max = $$props.max);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*distribution*/ 2) {
    			$$invalidate(2, max = Object.entries(distribution).reduce(
    				(p, c) => {
    					if (!isNaN(Number(c[0]))) return Math.max(c[1], p);
    					return p;
    				},
    				1
    			));
    		}
    	};

    	return [game, distribution, max];
    }

    class Distribution extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { game: 0, distribution: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Distribution",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*game*/ ctx[0] === undefined && !('game' in props)) {
    			console.warn("<Distribution> was created without expected prop 'game'");
    		}

    		if (/*distribution*/ ctx[1] === undefined && !('distribution' in props)) {
    			console.warn("<Distribution> was created without expected prop 'distribution'");
    		}
    	}

    	get game() {
    		throw new Error("<Distribution>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set game(value) {
    		throw new Error("<Distribution>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get distribution() {
    		throw new Error("<Distribution>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set distribution(value) {
    		throw new Error("<Distribution>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Game.svelte generated by Svelte v3.50.1 */

    const { console: console_1 } = globals;

    const file$1 = "src/components/Game.svelte";

    // (151:0) <Modal  bind:visible={showTutorial}  on:close|once={() => $settings.tutorial === 3 && --$settings.tutorial}  fullscreen={$settings.tutorial === 0} >
    function create_default_slot_2(ctx) {
    	let tutorial;
    	let current;

    	tutorial = new Tutorial({
    			props: { visible: /*showTutorial*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tutorial.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tutorial, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tutorial_changes = {};
    			if (dirty[0] & /*showTutorial*/ 16) tutorial_changes.visible = /*showTutorial*/ ctx[4];
    			tutorial.$set(tutorial_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tutorial.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tutorial.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tutorial, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(151:0) <Modal  bind:visible={showTutorial}  on:close|once={() => $settings.tutorial === 3 && --$settings.tutorial}  fullscreen={$settings.tutorial === 0} >",
    		ctx
    	});

    	return block;
    }

    // (159:0) <Modal bind:visible={showStats}>
    function create_default_slot_1(ctx) {
    	let statistics;
    	let t0;
    	let distribution;
    	let t1;
    	let timer_1;
    	let current;

    	statistics = new Statistics({
    			props: { data: /*stats*/ ctx[0] },
    			$$inline: true
    		});

    	distribution = new Distribution({
    			props: {
    				distribution: /*stats*/ ctx[0].guesses,
    				game: /*game*/ ctx[1]
    			},
    			$$inline: true
    		});

    	let timer_1_props = {};
    	timer_1 = new Timer({ props: timer_1_props, $$inline: true });
    	/*timer_1_binding*/ ctx[30](timer_1);
    	timer_1.$on("reload", /*reload*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(statistics.$$.fragment);
    			t0 = space();
    			create_component(distribution.$$.fragment);
    			t1 = space();
    			create_component(timer_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(statistics, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(distribution, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(timer_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const statistics_changes = {};
    			if (dirty[0] & /*stats*/ 1) statistics_changes.data = /*stats*/ ctx[0];
    			statistics.$set(statistics_changes);
    			const distribution_changes = {};
    			if (dirty[0] & /*stats*/ 1) distribution_changes.distribution = /*stats*/ ctx[0].guesses;
    			if (dirty[0] & /*game*/ 2) distribution_changes.game = /*game*/ ctx[1];
    			distribution.$set(distribution_changes);
    			const timer_1_changes = {};
    			timer_1.$set(timer_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(statistics.$$.fragment, local);
    			transition_in(distribution.$$.fragment, local);
    			transition_in(timer_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(statistics.$$.fragment, local);
    			transition_out(distribution.$$.fragment, local);
    			transition_out(timer_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(statistics, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(distribution, detaching);
    			if (detaching) detach_dev(t1);
    			/*timer_1_binding*/ ctx[30](null);
    			destroy_component(timer_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(159:0) <Modal bind:visible={showStats}>",
    		ctx
    	});

    	return block;
    }

    // (170:1) {#if game.active}
    function create_if_block$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "give up";
    			attr_dev(div, "class", "concede svelte-aoitwj");
    			add_location(div, file$1, 170, 2, 5611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*concede*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(170:1) {#if game.active}",
    		ctx
    	});

    	return block;
    }

    // (168:0) <Modal fullscreen={true} bind:visible={showSettings}>
    function create_default_slot$1(ctx) {
    	let settings_1;
    	let t;
    	let if_block_anchor;
    	let current;

    	settings_1 = new Settings({
    			props: { state: /*game*/ ctx[1] },
    			$$inline: true
    		});

    	let if_block = /*game*/ ctx[1].active && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			create_component(settings_1.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(settings_1, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const settings_1_changes = {};
    			if (dirty[0] & /*game*/ 2) settings_1_changes.state = /*game*/ ctx[1];
    			settings_1.$set(settings_1_changes);

    			if (/*game*/ ctx[1].active) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(settings_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(settings_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(settings_1, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(168:0) <Modal fullscreen={true} bind:visible={showSettings}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let header;
    	let updating_showRefresh;
    	let t0;
    	let board_1;
    	let updating_value;
    	let t1;
    	let keyboard;
    	let updating_value_1;
    	let t2;
    	let modal0;
    	let updating_visible;
    	let t3;
    	let modal1;
    	let updating_visible_1;
    	let t4;
    	let modal2;
    	let updating_visible_2;
    	let current;

    	function header_showRefresh_binding(value) {
    		/*header_showRefresh_binding*/ ctx[17](value);
    	}

    	let header_props = {
    		tutorial: /*$settings*/ ctx[11].tutorial === 2,
    		showStats: /*stats*/ ctx[0].played > 0 || /*modeData*/ ctx[3].modes[/*$mode*/ ctx[10]].historical && !/*game*/ ctx[1].active
    	};

    	if (/*showRefresh*/ ctx[7] !== void 0) {
    		header_props.showRefresh = /*showRefresh*/ ctx[7];
    	}

    	header = new Header({ props: header_props, $$inline: true });
    	binding_callbacks.push(() => bind(header, 'showRefresh', header_showRefresh_binding));
    	header.$on("closeTutPopUp", once(/*closeTutPopUp_handler*/ ctx[18]));
    	header.$on("stats", /*stats_handler*/ ctx[19]);
    	header.$on("tutorial", /*tutorial_handler*/ ctx[20]);
    	header.$on("settings", /*settings_handler*/ ctx[21]);
    	header.$on("reload", /*reload*/ ctx[14]);

    	function board_1_value_binding(value) {
    		/*board_1_value_binding*/ ctx[23](value);
    	}

    	let board_1_props = {
    		tutorial: /*$settings*/ ctx[11].tutorial === 1,
    		board: /*game*/ ctx[1].board,
    		guesses: /*game*/ ctx[1].guesses,
    		icon: /*modeData*/ ctx[3].modes[/*$mode*/ ctx[10]].icon
    	};

    	if (/*$server_response*/ ctx[2]["guessedWords"] !== void 0) {
    		board_1_props.value = /*$server_response*/ ctx[2]["guessedWords"];
    	}

    	board_1 = new Board({ props: board_1_props, $$inline: true });
    	/*board_1_binding*/ ctx[22](board_1);
    	binding_callbacks.push(() => bind(board_1, 'value', board_1_value_binding));
    	board_1.$on("closeTutPopUp", once(/*closeTutPopUp_handler_1*/ ctx[24]));

    	function keyboard_value_binding(value) {
    		/*keyboard_value_binding*/ ctx[25](value);
    	}

    	let keyboard_props = {
    		disabled: !/*game*/ ctx[1].active || /*$settings*/ ctx[11].tutorial === 3
    	};

    	if (/*game*/ ctx[1].board.words[/*game*/ ctx[1].guesses === ROWS
    	? 0
    	: /*game*/ ctx[1].guesses] !== void 0) {
    		keyboard_props.value = /*game*/ ctx[1].board.words[/*game*/ ctx[1].guesses === ROWS
    		? 0
    		: /*game*/ ctx[1].guesses];
    	}

    	keyboard = new Keyboard({ props: keyboard_props, $$inline: true });
    	binding_callbacks.push(() => bind(keyboard, 'value', keyboard_value_binding));
    	keyboard.$on("keystroke", /*keystroke_handler*/ ctx[26]);
    	keyboard.$on("submitWord", /*submitWord*/ ctx[12]);
    	keyboard.$on("esc", /*esc_handler*/ ctx[27]);

    	function modal0_visible_binding(value) {
    		/*modal0_visible_binding*/ ctx[28](value);
    	}

    	let modal0_props = {
    		fullscreen: /*$settings*/ ctx[11].tutorial === 0,
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*showTutorial*/ ctx[4] !== void 0) {
    		modal0_props.visible = /*showTutorial*/ ctx[4];
    	}

    	modal0 = new Modal({ props: modal0_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal0, 'visible', modal0_visible_binding));
    	modal0.$on("close", once(/*close_handler*/ ctx[29]));

    	function modal1_visible_binding(value) {
    		/*modal1_visible_binding*/ ctx[31](value);
    	}

    	let modal1_props = {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*showStats*/ ctx[6] !== void 0) {
    		modal1_props.visible = /*showStats*/ ctx[6];
    	}

    	modal1 = new Modal({ props: modal1_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal1, 'visible', modal1_visible_binding));

    	function modal2_visible_binding(value) {
    		/*modal2_visible_binding*/ ctx[32](value);
    	}

    	let modal2_props = {
    		fullscreen: true,
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*showSettings*/ ctx[5] !== void 0) {
    		modal2_props.visible = /*showSettings*/ ctx[5];
    	}

    	modal2 = new Modal({ props: modal2_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal2, 'visible', modal2_visible_binding));

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(board_1.$$.fragment);
    			t1 = space();
    			create_component(keyboard.$$.fragment);
    			t2 = space();
    			create_component(modal0.$$.fragment);
    			t3 = space();
    			create_component(modal1.$$.fragment);
    			t4 = space();
    			create_component(modal2.$$.fragment);
    			set_style(main, "--rows", ROWS);
    			set_style(main, "--cols", COLS);
    			attr_dev(main, "class", "svelte-aoitwj");
    			toggle_class(main, "guesses", /*game*/ ctx[1].guesses !== 0);
    			add_location(main, file$1, 114, 0, 4061);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			mount_component(board_1, main, null);
    			append_dev(main, t1);
    			mount_component(keyboard, main, null);
    			insert_dev(target, t2, anchor);
    			mount_component(modal0, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(modal1, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(modal2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const header_changes = {};
    			if (dirty[0] & /*$settings*/ 2048) header_changes.tutorial = /*$settings*/ ctx[11].tutorial === 2;
    			if (dirty[0] & /*stats, modeData, $mode, game*/ 1035) header_changes.showStats = /*stats*/ ctx[0].played > 0 || /*modeData*/ ctx[3].modes[/*$mode*/ ctx[10]].historical && !/*game*/ ctx[1].active;

    			if (!updating_showRefresh && dirty[0] & /*showRefresh*/ 128) {
    				updating_showRefresh = true;
    				header_changes.showRefresh = /*showRefresh*/ ctx[7];
    				add_flush_callback(() => updating_showRefresh = false);
    			}

    			header.$set(header_changes);
    			const board_1_changes = {};
    			if (dirty[0] & /*$settings*/ 2048) board_1_changes.tutorial = /*$settings*/ ctx[11].tutorial === 1;
    			if (dirty[0] & /*game*/ 2) board_1_changes.board = /*game*/ ctx[1].board;
    			if (dirty[0] & /*game*/ 2) board_1_changes.guesses = /*game*/ ctx[1].guesses;
    			if (dirty[0] & /*modeData, $mode*/ 1032) board_1_changes.icon = /*modeData*/ ctx[3].modes[/*$mode*/ ctx[10]].icon;

    			if (!updating_value && dirty[0] & /*$server_response*/ 4) {
    				updating_value = true;
    				board_1_changes.value = /*$server_response*/ ctx[2]["guessedWords"];
    				add_flush_callback(() => updating_value = false);
    			}

    			board_1.$set(board_1_changes);
    			const keyboard_changes = {};
    			if (dirty[0] & /*game, $settings*/ 2050) keyboard_changes.disabled = !/*game*/ ctx[1].active || /*$settings*/ ctx[11].tutorial === 3;

    			if (!updating_value_1 && dirty[0] & /*game*/ 2) {
    				updating_value_1 = true;

    				keyboard_changes.value = /*game*/ ctx[1].board.words[/*game*/ ctx[1].guesses === ROWS
    				? 0
    				: /*game*/ ctx[1].guesses];

    				add_flush_callback(() => updating_value_1 = false);
    			}

    			keyboard.$set(keyboard_changes);

    			if (!current || dirty[0] & /*game*/ 2) {
    				toggle_class(main, "guesses", /*game*/ ctx[1].guesses !== 0);
    			}

    			const modal0_changes = {};
    			if (dirty[0] & /*$settings*/ 2048) modal0_changes.fullscreen = /*$settings*/ ctx[11].tutorial === 0;

    			if (dirty[0] & /*showTutorial*/ 16 | dirty[1] & /*$$scope*/ 256) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty[0] & /*showTutorial*/ 16) {
    				updating_visible = true;
    				modal0_changes.visible = /*showTutorial*/ ctx[4];
    				add_flush_callback(() => updating_visible = false);
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty[0] & /*timer, stats, game*/ 515 | dirty[1] & /*$$scope*/ 256) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_1 && dirty[0] & /*showStats*/ 64) {
    				updating_visible_1 = true;
    				modal1_changes.visible = /*showStats*/ ctx[6];
    				add_flush_callback(() => updating_visible_1 = false);
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty[0] & /*game*/ 2 | dirty[1] & /*$$scope*/ 256) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_2 && dirty[0] & /*showSettings*/ 32) {
    				updating_visible_2 = true;
    				modal2_changes.visible = /*showSettings*/ ctx[5];
    				add_flush_callback(() => updating_visible_2 = false);
    			}

    			modal2.$set(modal2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(board_1.$$.fragment, local);
    			transition_in(keyboard.$$.fragment, local);
    			transition_in(modal0.$$.fragment, local);
    			transition_in(modal1.$$.fragment, local);
    			transition_in(modal2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(board_1.$$.fragment, local);
    			transition_out(keyboard.$$.fragment, local);
    			transition_out(modal0.$$.fragment, local);
    			transition_out(modal1.$$.fragment, local);
    			transition_out(modal2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			/*board_1_binding*/ ctx[22](null);
    			destroy_component(board_1);
    			destroy_component(keyboard);
    			if (detaching) detach_dev(t2);
    			destroy_component(modal0, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(modal1, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(modal2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $mode;
    	let $letterStates;
    	let $server_response;
    	let $settings;
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(10, $mode = $$value));
    	validate_store(letterStates, 'letterStates');
    	component_subscribe($$self, letterStates, $$value => $$invalidate(33, $letterStates = $$value));
    	validate_store(server_response, 'server_response');
    	component_subscribe($$self, server_response, $$value => $$invalidate(2, $server_response = $$value));
    	validate_store(settings, 'settings');
    	component_subscribe($$self, settings, $$value => $$invalidate(11, $settings = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Game', slots, []);
    	let { word } = $$props;
    	let { stats } = $$props;
    	let { game } = $$props;
    	let { toaster } = $$props;
    	setContext("toaster", toaster);
    	const version = getContext("version");

    	// implement transition delay on keys
    	const delay = DELAY_INCREMENT * ROWS + 800;

    	let showTutorial = $settings.tutorial === 3;
    	let showSettings = false;
    	let showStats = false;
    	let showRefresh = false;
    	let board;
    	let timer;

    	function submitWord() {
    		// The server should handle the following errors:
    		//    1. The guess did not have enough letters.
    		//    2. The guess was not a valid word.
    		console.log("submitWord");

    		console.log(Date.now());
    		console.log($server_response);

    		if ($server_response["errorMessage"]) {
    			toaster.pop($server_response["errorMessage"]);
    			board.shake(game.guesses);
    		} else {
    			// If it's not an error, then the guess was valid. Increment game.guesses
    			// so the Tuffle frontend will flip the colors of the guess.
    			$$invalidate(1, ++game.guesses, game);

    			console.log(word);

    			if ($server_response["gameStatus"] == "win") {
    				win();
    			} else if ($server_response["gameStatus"] == "lose") {
    				lose();
    			}
    		}
    	}

    	function win() {
    		board.bounce(game.guesses - 1);
    		$$invalidate(1, game.active = false, game);
    		setTimeout(() => toaster.pop(PRAISE[game.guesses - 1]), DELAY_INCREMENT * COLS + DELAY_INCREMENT);
    		setTimeout(setShowStatsTrue, delay * 1.4);
    		$$invalidate(0, ++stats.guesses[game.guesses], stats);
    		$$invalidate(0, ++stats.played, stats);

    		if ("streak" in stats) {
    			$$invalidate(
    				0,
    				stats.streak = modeData.modes[$mode].seed - stats.lastGame > modeData.modes[$mode].unit
    				? 1
    				: stats.streak + 1,
    				stats
    			);

    			if (stats.streak > stats.maxStreak) $$invalidate(0, stats.maxStreak = stats.streak, stats);
    		}

    		$$invalidate(0, stats.lastGame = modeData.modes[$mode].seed, stats);
    		localStorage.setItem(`stats-${$mode}`, JSON.stringify(stats));
    	}

    	function lose() {
    		// Display the tuffle if the player fails to guess it.
    		toaster.pop("The tuffle was: " + $server_response["answer"], 2);

    		$$invalidate(1, game.active = false, game);
    		setTimeout(setShowStatsTrue, delay);
    		$$invalidate(0, ++stats.guesses.fail, stats);
    		$$invalidate(0, ++stats.played, stats);
    		if ("streak" in stats) $$invalidate(0, stats.streak = 0, stats);
    		$$invalidate(0, stats.lastGame = modeData.modes[$mode].seed, stats);
    		localStorage.setItem(`stats-${$mode}`, JSON.stringify(stats));
    	}

    	function concede() {
    		$$invalidate(5, showSettings = false);
    		setTimeout(setShowStatsTrue, DELAY_INCREMENT);
    		lose();
    	}

    	function reload() {
    		$$invalidate(3, modeData.modes[$mode].historical = false, modeData);
    		$$invalidate(3, modeData.modes[$mode].seed = newSeed(), modeData);

    		// newGame();
    		newGame().then(sr => set_store_value(server_response, $server_response = sr, $server_response));

    		$$invalidate(1, game = createNewGame($mode));
    		$$invalidate(15, word = words.words[seededRandomInt(0, words.words.length, modeData.modes[$mode].seed)]);
    		set_store_value(letterStates, $letterStates = createLetterStates(), $letterStates);
    		$$invalidate(6, showStats = false);
    		$$invalidate(7, showRefresh = false);
    		timer.reset($mode);
    	}

    	function setShowStatsTrue() {
    		if (!game.active) $$invalidate(6, showStats = true);
    	}

    	onMount(() => {
    		if (!game.active) setTimeout(setShowStatsTrue, delay);
    	});

    	const writable_props = ['word', 'stats', 'game', 'toaster'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	function header_showRefresh_binding(value) {
    		showRefresh = value;
    		$$invalidate(7, showRefresh);
    	}

    	const closeTutPopUp_handler = () => set_store_value(settings, $settings.tutorial = 1, $settings);
    	const stats_handler = () => $$invalidate(6, showStats = true);
    	const tutorial_handler = () => $$invalidate(4, showTutorial = true);
    	const settings_handler = () => $$invalidate(5, showSettings = true);

    	function board_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			board = $$value;
    			$$invalidate(8, board);
    		});
    	}

    	function board_1_value_binding(value) {
    		if ($$self.$$.not_equal($server_response["guessedWords"], value)) {
    			$server_response["guessedWords"] = value;
    			server_response.set($server_response);
    		}
    	}

    	const closeTutPopUp_handler_1 = () => set_store_value(settings, $settings.tutorial = 0, $settings);

    	function keyboard_value_binding(value) {
    		if ($$self.$$.not_equal(game.board.words[game.guesses === ROWS ? 0 : game.guesses], value)) {
    			game.board.words[game.guesses === ROWS ? 0 : game.guesses] = value;
    			($$invalidate(1, game), $$invalidate(2, $server_response));
    		}
    	}

    	const keystroke_handler = () => {
    		if ($settings.tutorial) set_store_value(settings, $settings.tutorial = 0, $settings);
    		board.hideCtx();
    	};

    	const esc_handler = () => {
    		$$invalidate(4, showTutorial = false);
    		$$invalidate(6, showStats = false);
    		$$invalidate(5, showSettings = false);
    	};

    	function modal0_visible_binding(value) {
    		showTutorial = value;
    		$$invalidate(4, showTutorial);
    	}

    	const close_handler = () => $settings.tutorial === 3 && set_store_value(settings, --$settings.tutorial, $settings);

    	function timer_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			timer = $$value;
    			$$invalidate(9, timer);
    		});
    	}

    	function modal1_visible_binding(value) {
    		showStats = value;
    		$$invalidate(6, showStats);
    	}

    	function modal2_visible_binding(value) {
    		showSettings = value;
    		$$invalidate(5, showSettings);
    	}

    	$$self.$$set = $$props => {
    		if ('word' in $$props) $$invalidate(15, word = $$props.word);
    		if ('stats' in $$props) $$invalidate(0, stats = $$props.stats);
    		if ('game' in $$props) $$invalidate(1, game = $$props.game);
    		if ('toaster' in $$props) $$invalidate(16, toaster = $$props.toaster);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		Header,
    		Board,
    		Keyboard,
    		Modal,
    		getContext,
    		onMount,
    		setContext,
    		Settings,
    		Seperator,
    		Tutorial,
    		Statistics,
    		Distribution,
    		Timer,
    		Toaster,
    		contractNum,
    		DELAY_INCREMENT,
    		PRAISE,
    		getState,
    		modeData,
    		ROWS,
    		COLS,
    		newSeed,
    		createNewGame,
    		seededRandomInt,
    		createLetterStates,
    		words,
    		letterStates,
    		settings,
    		mode,
    		server_response,
    		emptyResponse,
    		boardStateFromServerResponse,
    		letterStateFromServerResponse,
    		newGame,
    		word,
    		stats,
    		game,
    		toaster,
    		version,
    		delay,
    		showTutorial,
    		showSettings,
    		showStats,
    		showRefresh,
    		board,
    		timer,
    		submitWord,
    		win,
    		lose,
    		concede,
    		reload,
    		setShowStatsTrue,
    		$mode,
    		$letterStates,
    		$server_response,
    		$settings
    	});

    	$$self.$inject_state = $$props => {
    		if ('word' in $$props) $$invalidate(15, word = $$props.word);
    		if ('stats' in $$props) $$invalidate(0, stats = $$props.stats);
    		if ('game' in $$props) $$invalidate(1, game = $$props.game);
    		if ('toaster' in $$props) $$invalidate(16, toaster = $$props.toaster);
    		if ('showTutorial' in $$props) $$invalidate(4, showTutorial = $$props.showTutorial);
    		if ('showSettings' in $$props) $$invalidate(5, showSettings = $$props.showSettings);
    		if ('showStats' in $$props) $$invalidate(6, showStats = $$props.showStats);
    		if ('showRefresh' in $$props) $$invalidate(7, showRefresh = $$props.showRefresh);
    		if ('board' in $$props) $$invalidate(8, board = $$props.board);
    		if ('timer' in $$props) $$invalidate(9, timer = $$props.timer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$server_response*/ 4) {
    			($$invalidate(
    				1,
    				game.board = {
    					words: $server_response["guessedWords"],
    					state: boardStateFromServerResponse($server_response),
    					guessCount: $server_response["guessCount"]
    				},
    				game
    			));
    		}

    		if ($$self.$$.dirty[0] & /*$server_response*/ 4) {
    			(set_store_value(letterStates, $letterStates = letterStateFromServerResponse($server_response), $letterStates));
    		}
    	};

    	return [
    		stats,
    		game,
    		$server_response,
    		modeData,
    		showTutorial,
    		showSettings,
    		showStats,
    		showRefresh,
    		board,
    		timer,
    		$mode,
    		$settings,
    		submitWord,
    		concede,
    		reload,
    		word,
    		toaster,
    		header_showRefresh_binding,
    		closeTutPopUp_handler,
    		stats_handler,
    		tutorial_handler,
    		settings_handler,
    		board_1_binding,
    		board_1_value_binding,
    		closeTutPopUp_handler_1,
    		keyboard_value_binding,
    		keystroke_handler,
    		esc_handler,
    		modal0_visible_binding,
    		close_handler,
    		timer_1_binding,
    		modal1_visible_binding,
    		modal2_visible_binding
    	];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { word: 15, stats: 0, game: 1, toaster: 16 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*word*/ ctx[15] === undefined && !('word' in props)) {
    			console_1.warn("<Game> was created without expected prop 'word'");
    		}

    		if (/*stats*/ ctx[0] === undefined && !('stats' in props)) {
    			console_1.warn("<Game> was created without expected prop 'stats'");
    		}

    		if (/*game*/ ctx[1] === undefined && !('game' in props)) {
    			console_1.warn("<Game> was created without expected prop 'game'");
    		}

    		if (/*toaster*/ ctx[16] === undefined && !('toaster' in props)) {
    			console_1.warn("<Game> was created without expected prop 'toaster'");
    		}
    	}

    	get word() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set word(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stats() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stats(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get game() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set game(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toaster() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toaster(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/BackendURLModal.svelte generated by Svelte v3.50.1 */
    const file = "src/components/BackendURLModal.svelte";

    // (14:0) <Modal bind:visible={isLocalStorage} closable={false}>
    function create_default_slot(ctx) {
    	let form;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let fieldset;
    	let input;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			h1 = element("h1");
    			h1.textContent = "Backend URL";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Enter the URL of the backend server. If you don't know what this is,\n\t\t\trefer to the documentation or leave it as-is.";
    			t3 = space();
    			fieldset = element("fieldset");
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Save";
    			add_location(h1, file, 15, 2, 532);
    			attr_dev(p, "class", "svelte-wtd0mj");
    			add_location(p, file, 16, 2, 555);
    			attr_dev(input, "placeholder", BACKEND_URL);
    			attr_dev(input, "class", "svelte-wtd0mj");
    			add_location(input, file, 21, 3, 703);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "svelte-wtd0mj");
    			add_location(button, file, 30, 3, 865);
    			attr_dev(fieldset, "class", "svelte-wtd0mj");
    			add_location(fieldset, file, 20, 2, 689);
    			add_location(form, file, 14, 1, 470);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, h1);
    			append_dev(form, t1);
    			append_dev(form, p);
    			append_dev(form, t3);
    			append_dev(form, fieldset);
    			append_dev(fieldset, input);
    			set_input_value(input, /*url*/ ctx[0]);
    			append_dev(fieldset, t4);
    			append_dev(fieldset, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(input, "input", /*input_handler*/ ctx[3], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*submit_handler*/ ctx[4]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*url*/ 1 && input.value !== /*url*/ ctx[0]) {
    				set_input_value(input, /*url*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(14:0) <Modal bind:visible={isLocalStorage} closable={false}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let modal;
    	let updating_visible;
    	let current;

    	function modal_visible_binding(value) {
    		/*modal_visible_binding*/ ctx[5](value);
    	}

    	let modal_props = {
    		closable: false,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*isLocalStorage*/ ctx[1] !== void 0) {
    		modal_props.visible = /*isLocalStorage*/ ctx[1];
    	}

    	modal = new Modal({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, 'visible', modal_visible_binding));

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, url*/ 65) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty & /*isLocalStorage*/ 2) {
    				updating_visible = true;
    				modal_changes.visible = /*isLocalStorage*/ ctx[1];
    				add_flush_callback(() => updating_visible = false);
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BackendURLModal', slots, []);
    	let url = BACKEND_URL;
    	let isLocalStorage = false;

    	// I don't know of a better way.
    	onDestroy(backendURL.subscribe(value => {
    		$$invalidate(1, isLocalStorage = value === "localstorage");
    	}));

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BackendURLModal> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		url = this.value;
    		$$invalidate(0, url);
    	}

    	const input_handler = () => {
    		if (url.endsWith("/")) {
    			$$invalidate(0, url = url.slice(0, -1));
    		}
    	};

    	const submit_handler = () => backendURL.set(url);

    	function modal_visible_binding(value) {
    		isLocalStorage = value;
    		$$invalidate(1, isLocalStorage);
    	}

    	$$self.$capture_state = () => ({
    		Modal,
    		onDestroy,
    		backendURL,
    		defaultURL: BACKEND_URL,
    		get: get_store_value,
    		url,
    		isLocalStorage
    	});

    	$$self.$inject_state = $$props => {
    		if ('url' in $$props) $$invalidate(0, url = $$props.url);
    		if ('isLocalStorage' in $$props) $$invalidate(1, isLocalStorage = $$props.isLocalStorage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		url,
    		isLocalStorage,
    		input_input_handler,
    		input_handler,
    		submit_handler,
    		modal_visible_binding
    	];
    }

    class BackendURLModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackendURLModal",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.50.1 */

    // (78:0) {#if toaster}
    function create_if_block(ctx) {
    	let game;
    	let updating_game;
    	let current;

    	function game_game_binding(value) {
    		/*game_game_binding*/ ctx[5](value);
    	}

    	let game_props = {
    		stats: /*stats*/ ctx[1],
    		word: /*word*/ ctx[2],
    		toaster: /*toaster*/ ctx[3]
    	};

    	if (/*state*/ ctx[0] !== void 0) {
    		game_props.game = /*state*/ ctx[0];
    	}

    	game = new Game({ props: game_props, $$inline: true });
    	binding_callbacks.push(() => bind(game, 'game', game_game_binding));

    	const block = {
    		c: function create() {
    			create_component(game.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(game, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const game_changes = {};
    			if (dirty & /*stats*/ 2) game_changes.stats = /*stats*/ ctx[1];
    			if (dirty & /*word*/ 4) game_changes.word = /*word*/ ctx[2];
    			if (dirty & /*toaster*/ 8) game_changes.toaster = /*toaster*/ ctx[3];

    			if (!updating_game && dirty & /*state*/ 1) {
    				updating_game = true;
    				game_changes.game = /*state*/ ctx[0];
    				add_flush_callback(() => updating_game = false);
    			}

    			game.$set(game_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(game.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(game.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(game, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(78:0) {#if toaster}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let toaster_1;
    	let t0;
    	let t1;
    	let backendurlmodal;
    	let current;
    	let toaster_1_props = {};
    	toaster_1 = new Toaster({ props: toaster_1_props, $$inline: true });
    	/*toaster_1_binding*/ ctx[4](toaster_1);
    	let if_block = /*toaster*/ ctx[3] && create_if_block(ctx);
    	backendurlmodal = new BackendURLModal({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(toaster_1.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(backendurlmodal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(toaster_1, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(backendurlmodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const toaster_1_changes = {};
    			toaster_1.$set(toaster_1_changes);

    			if (/*toaster*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*toaster*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t1.parentNode, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toaster_1.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(backendurlmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toaster_1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(backendurlmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*toaster_1_binding*/ ctx[4](null);
    			destroy_component(toaster_1, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(backendurlmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $mode;
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(7, $mode = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let stats;
    	let word;
    	let state;
    	settings.set(JSON.parse(localStorage.getItem("settings")) || createDefaultSettings());
    	settings.subscribe(s => localStorage.setItem("settings", JSON.stringify(s)));
    	const hash = window.location.hash.slice(1).split("/");

    	const modeVal = !isNaN(GameMode[hash[0]])
    	? GameMode[hash[0]]
    	: parseInt(localStorage.getItem("mode")) || modeData.default;

    	mode.set(modeVal);

    	// If this is a link to a specific word make sure that that is the word
    	if (!isNaN(parseInt(hash[1])) && parseInt(hash[1]) < getWordNumber(modeVal)) {
    		modeData.modes[modeVal].seed = (parseInt(hash[1]) - 1) * modeData.modes[modeVal].unit + modeData.modes[modeVal].start;
    		modeData.modes[modeVal].historical = true;
    	}

    	mode.subscribe(m => {
    		localStorage.setItem("mode", `${m}`);
    		window.location.hash = GameMode[m];
    		$$invalidate(1, stats = JSON.parse(localStorage.getItem(`stats-${m}`)) || createDefaultStats(m));
    		$$invalidate(2, word = words.words[seededRandomInt(0, words.words.length, modeData.modes[m].seed)]);
    		let temp;

    		if (modeData.modes[m].historical === true) {
    			temp = JSON.parse(localStorage.getItem(`state-${m}-h`));

    			if (!temp || temp.wordNumber !== getWordNumber(m)) {
    				$$invalidate(0, state = createNewGame(m));
    			} else {
    				$$invalidate(0, state = temp);
    			}
    		} else {
    			temp = JSON.parse(localStorage.getItem(`state-${m}`));

    			if (!temp || modeData.modes[m].seed - temp.time >= modeData.modes[m].unit) {
    				$$invalidate(0, state = createNewGame(m));
    			} else {
    				// This is for backwards compatibility, can be removed in a day
    				if (!temp.wordNumber) {
    					temp.wordNumber = getWordNumber(m);
    				}

    				$$invalidate(0, state = temp);
    			}
    		}

    		// Set the letter states when data for a new game mode is loaded so the keyboard is correct
    		const letters = createLetterStates();

    		for (let row = 0; row < ROWS; ++row) {
    			for (let col = 0; col < state.board.words[row].length; ++col) {
    				if (letters[state.board.words[row][col]] === "🔳" || state.board.state[row][col] === "🟩") {
    					letters[state.board.words[row][col]] = state.board.state[row][col];
    				}
    			}
    		}

    		letterStates.set(letters);
    	});

    	function saveState(state) {
    		if (modeData.modes[$mode].historical) {
    			localStorage.setItem(`state-${$mode}-h`, JSON.stringify(state));
    		} else {
    			localStorage.setItem(`state-${$mode}`, JSON.stringify(state));
    		}
    	}

    	let toaster;
    	document.title = "Tuffle | CPSC121 Game";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function toaster_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			toaster = $$value;
    			$$invalidate(3, toaster);
    		});
    	}

    	function game_game_binding(value) {
    		state = value;
    		$$invalidate(0, state);
    	}

    	$$self.$capture_state = () => ({
    		modeData,
    		seededRandomInt,
    		createDefaultStats,
    		createNewGame,
    		createDefaultSettings,
    		createLetterStates,
    		ROWS,
    		getWordNumber,
    		words,
    		Game,
    		BackendURLModal,
    		letterStates,
    		settings,
    		mode,
    		GameMode,
    		Toaster,
    		setContext,
    		stats,
    		word,
    		state,
    		hash,
    		modeVal,
    		saveState,
    		toaster,
    		$mode
    	});

    	$$self.$inject_state = $$props => {
    		if ('stats' in $$props) $$invalidate(1, stats = $$props.stats);
    		if ('word' in $$props) $$invalidate(2, word = $$props.word);
    		if ('state' in $$props) $$invalidate(0, state = $$props.state);
    		if ('toaster' in $$props) $$invalidate(3, toaster = $$props.toaster);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*state*/ 1) {
    			saveState(state);
    		}
    	};

    	return [state, stats, word, toaster, toaster_1_binding, game_game_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    //! IF ANYTHING IN THIS FILE IS CHANGED MAKE SURE setVersion.js HAS ALSO BEEN UPDATED
    var main = new App({
        target: document.body,
        props: {
            version: "1.0",
        }
    });

    return main;

})();
//# sourceMappingURL=bundle.js.map
