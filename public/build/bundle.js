
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

    const ROWS = 6;
    const COLS = 5;
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
    			add_location(div, file$g, 38, 0, 941);
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
    			getRowData(num, board);
    		} // pAns = words.words.filter((w) => match(w)).length;
    		// pSols = pAns + words.valid.filter((w) => match(w)).length;
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

    const file$1 = "src/components/Game.svelte";

    // (131:0) <Modal  bind:visible={showTutorial}  on:close|once={() => $settings.tutorial === 3 && --$settings.tutorial}  fullscreen={$settings.tutorial === 0} >
    function create_default_slot_2(ctx) {
    	let tutorial;
    	let current;

    	tutorial = new Tutorial({
    			props: { visible: /*showTutorial*/ ctx[3] },
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
    			if (dirty[0] & /*showTutorial*/ 8) tutorial_changes.visible = /*showTutorial*/ ctx[3];
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
    		source: "(131:0) <Modal  bind:visible={showTutorial}  on:close|once={() => $settings.tutorial === 3 && --$settings.tutorial}  fullscreen={$settings.tutorial === 0} >",
    		ctx
    	});

    	return block;
    }

    // (139:0) <Modal bind:visible={showStats}>
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
    	/*timer_1_binding*/ ctx[28](timer_1);
    	timer_1.$on("reload", /*reload*/ ctx[13]);

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
    			/*timer_1_binding*/ ctx[28](null);
    			destroy_component(timer_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(139:0) <Modal bind:visible={showStats}>",
    		ctx
    	});

    	return block;
    }

    // (150:1) {#if game.active}
    function create_if_block$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "give up";
    			attr_dev(div, "class", "concede svelte-aoitwj");
    			add_location(div, file$1, 150, 2, 4898);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*concede*/ ctx[12], false, false, false);
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
    		source: "(150:1) {#if game.active}",
    		ctx
    	});

    	return block;
    }

    // (148:0) <Modal fullscreen={true} bind:visible={showSettings}>
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
    		source: "(148:0) <Modal fullscreen={true} bind:visible={showSettings}>",
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
    		/*header_showRefresh_binding*/ ctx[15](value);
    	}

    	let header_props = {
    		tutorial: /*$settings*/ ctx[10].tutorial === 2,
    		showStats: /*stats*/ ctx[0].played > 0 || modeData.modes[/*$mode*/ ctx[9]].historical && !/*game*/ ctx[1].active
    	};

    	if (/*showRefresh*/ ctx[6] !== void 0) {
    		header_props.showRefresh = /*showRefresh*/ ctx[6];
    	}

    	header = new Header({ props: header_props, $$inline: true });
    	binding_callbacks.push(() => bind(header, 'showRefresh', header_showRefresh_binding));
    	header.$on("closeTutPopUp", once(/*closeTutPopUp_handler*/ ctx[16]));
    	header.$on("stats", /*stats_handler*/ ctx[17]);
    	header.$on("tutorial", /*tutorial_handler*/ ctx[18]);
    	header.$on("settings", /*settings_handler*/ ctx[19]);
    	header.$on("reload", /*reload*/ ctx[13]);

    	function board_1_value_binding(value) {
    		/*board_1_value_binding*/ ctx[21](value);
    	}

    	let board_1_props = {
    		tutorial: /*$settings*/ ctx[10].tutorial === 1,
    		board: /*game*/ ctx[1].board,
    		guesses: /*game*/ ctx[1].guesses,
    		icon: modeData.modes[/*$mode*/ ctx[9]].icon
    	};

    	if (/*$server_response*/ ctx[2]["guessedWords"] !== void 0) {
    		board_1_props.value = /*$server_response*/ ctx[2]["guessedWords"];
    	}

    	board_1 = new Board({ props: board_1_props, $$inline: true });
    	/*board_1_binding*/ ctx[20](board_1);
    	binding_callbacks.push(() => bind(board_1, 'value', board_1_value_binding));
    	board_1.$on("closeTutPopUp", once(/*closeTutPopUp_handler_1*/ ctx[22]));

    	function keyboard_value_binding(value) {
    		/*keyboard_value_binding*/ ctx[23](value);
    	}

    	let keyboard_props = {
    		disabled: !/*game*/ ctx[1].active || /*$settings*/ ctx[10].tutorial === 3
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
    	keyboard.$on("keystroke", /*keystroke_handler*/ ctx[24]);
    	keyboard.$on("submitWord", /*submitWord*/ ctx[11]);
    	keyboard.$on("esc", /*esc_handler*/ ctx[25]);

    	function modal0_visible_binding(value) {
    		/*modal0_visible_binding*/ ctx[26](value);
    	}

    	let modal0_props = {
    		fullscreen: /*$settings*/ ctx[10].tutorial === 0,
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*showTutorial*/ ctx[3] !== void 0) {
    		modal0_props.visible = /*showTutorial*/ ctx[3];
    	}

    	modal0 = new Modal({ props: modal0_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal0, 'visible', modal0_visible_binding));
    	modal0.$on("close", once(/*close_handler*/ ctx[27]));

    	function modal1_visible_binding(value) {
    		/*modal1_visible_binding*/ ctx[29](value);
    	}

    	let modal1_props = {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*showStats*/ ctx[5] !== void 0) {
    		modal1_props.visible = /*showStats*/ ctx[5];
    	}

    	modal1 = new Modal({ props: modal1_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal1, 'visible', modal1_visible_binding));

    	function modal2_visible_binding(value) {
    		/*modal2_visible_binding*/ ctx[30](value);
    	}

    	let modal2_props = {
    		fullscreen: true,
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*showSettings*/ ctx[4] !== void 0) {
    		modal2_props.visible = /*showSettings*/ ctx[4];
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
    			add_location(main, file$1, 94, 0, 3348);
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
    			if (dirty[0] & /*$settings*/ 1024) header_changes.tutorial = /*$settings*/ ctx[10].tutorial === 2;
    			if (dirty[0] & /*stats, $mode, game*/ 515) header_changes.showStats = /*stats*/ ctx[0].played > 0 || modeData.modes[/*$mode*/ ctx[9]].historical && !/*game*/ ctx[1].active;

    			if (!updating_showRefresh && dirty[0] & /*showRefresh*/ 64) {
    				updating_showRefresh = true;
    				header_changes.showRefresh = /*showRefresh*/ ctx[6];
    				add_flush_callback(() => updating_showRefresh = false);
    			}

    			header.$set(header_changes);
    			const board_1_changes = {};
    			if (dirty[0] & /*$settings*/ 1024) board_1_changes.tutorial = /*$settings*/ ctx[10].tutorial === 1;
    			if (dirty[0] & /*game*/ 2) board_1_changes.board = /*game*/ ctx[1].board;
    			if (dirty[0] & /*game*/ 2) board_1_changes.guesses = /*game*/ ctx[1].guesses;
    			if (dirty[0] & /*$mode*/ 512) board_1_changes.icon = modeData.modes[/*$mode*/ ctx[9]].icon;

    			if (!updating_value && dirty[0] & /*$server_response*/ 4) {
    				updating_value = true;
    				board_1_changes.value = /*$server_response*/ ctx[2]["guessedWords"];
    				add_flush_callback(() => updating_value = false);
    			}

    			board_1.$set(board_1_changes);
    			const keyboard_changes = {};
    			if (dirty[0] & /*game, $settings*/ 1026) keyboard_changes.disabled = !/*game*/ ctx[1].active || /*$settings*/ ctx[10].tutorial === 3;

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
    			if (dirty[0] & /*$settings*/ 1024) modal0_changes.fullscreen = /*$settings*/ ctx[10].tutorial === 0;

    			if (dirty[0] & /*showTutorial*/ 8 | dirty[1] & /*$$scope*/ 64) {
    				modal0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible && dirty[0] & /*showTutorial*/ 8) {
    				updating_visible = true;
    				modal0_changes.visible = /*showTutorial*/ ctx[3];
    				add_flush_callback(() => updating_visible = false);
    			}

    			modal0.$set(modal0_changes);
    			const modal1_changes = {};

    			if (dirty[0] & /*timer, stats, game*/ 259 | dirty[1] & /*$$scope*/ 64) {
    				modal1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_1 && dirty[0] & /*showStats*/ 32) {
    				updating_visible_1 = true;
    				modal1_changes.visible = /*showStats*/ ctx[5];
    				add_flush_callback(() => updating_visible_1 = false);
    			}

    			modal1.$set(modal1_changes);
    			const modal2_changes = {};

    			if (dirty[0] & /*game*/ 2 | dirty[1] & /*$$scope*/ 64) {
    				modal2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_visible_2 && dirty[0] & /*showSettings*/ 16) {
    				updating_visible_2 = true;
    				modal2_changes.visible = /*showSettings*/ ctx[4];
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
    			/*board_1_binding*/ ctx[20](null);
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
    	let $server_response;
    	let $settings;
    	let $letterStates;
    	validate_store(mode, 'mode');
    	component_subscribe($$self, mode, $$value => $$invalidate(9, $mode = $$value));
    	validate_store(server_response, 'server_response');
    	component_subscribe($$self, server_response, $$value => $$invalidate(2, $server_response = $$value));
    	validate_store(settings, 'settings');
    	component_subscribe($$self, settings, $$value => $$invalidate(10, $settings = $$value));
    	validate_store(letterStates, 'letterStates');
    	component_subscribe($$self, letterStates, $$value => $$invalidate(31, $letterStates = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Game', slots, []);
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
    		if ($server_response["errorMessage"]) {
    			toaster.pop($server_response["errorMessage"]);
    			board.shake(game.guesses);
    		} else {
    			// If it's not an error, then the guess was valid. Increment game.guesses
    			// so the Tuffle frontend will flip the colors of the guess.
    			$$invalidate(1, ++game.guesses, game);

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
    		$$invalidate(0, stats.lastGame = modeData.modes[$mode].seed, stats);
    		localStorage.setItem(`stats-${$mode}`, JSON.stringify(stats));
    	}

    	function concede() {
    		$$invalidate(4, showSettings = false);
    		setTimeout(setShowStatsTrue, DELAY_INCREMENT);
    		lose();
    	}

    	function reload() {
    		newGame().then(sr => set_store_value(server_response, $server_response = sr, $server_response));
    		$$invalidate(1, game = createNewGame($mode));

    		// $letterStates = createLetterStates();
    		$$invalidate(5, showStats = false);

    		$$invalidate(6, showRefresh = false);
    		timer.reset($mode);
    	}

    	function setShowStatsTrue() {
    		if (!game.active) $$invalidate(5, showStats = true);
    	}

    	onMount(() => {
    		if (!game.active) setTimeout(setShowStatsTrue, delay);
    	});

    	const writable_props = ['stats', 'game', 'toaster'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	function header_showRefresh_binding(value) {
    		showRefresh = value;
    		$$invalidate(6, showRefresh);
    	}

    	const closeTutPopUp_handler = () => set_store_value(settings, $settings.tutorial = 1, $settings);
    	const stats_handler = () => $$invalidate(5, showStats = true);
    	const tutorial_handler = () => $$invalidate(3, showTutorial = true);
    	const settings_handler = () => $$invalidate(4, showSettings = true);

    	function board_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			board = $$value;
    			$$invalidate(7, board);
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
    		$$invalidate(3, showTutorial = false);
    		$$invalidate(5, showStats = false);
    		$$invalidate(4, showSettings = false);
    	};

    	function modal0_visible_binding(value) {
    		showTutorial = value;
    		$$invalidate(3, showTutorial);
    	}

    	const close_handler = () => $settings.tutorial === 3 && set_store_value(settings, --$settings.tutorial, $settings);

    	function timer_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			timer = $$value;
    			$$invalidate(8, timer);
    		});
    	}

    	function modal1_visible_binding(value) {
    		showStats = value;
    		$$invalidate(5, showStats);
    	}

    	function modal2_visible_binding(value) {
    		showSettings = value;
    		$$invalidate(4, showSettings);
    	}

    	$$self.$$set = $$props => {
    		if ('stats' in $$props) $$invalidate(0, stats = $$props.stats);
    		if ('game' in $$props) $$invalidate(1, game = $$props.game);
    		if ('toaster' in $$props) $$invalidate(14, toaster = $$props.toaster);
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
    		letterStates,
    		settings,
    		mode,
    		server_response,
    		emptyResponse,
    		boardStateFromServerResponse,
    		letterStateFromServerResponse,
    		newGame,
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
    		$server_response,
    		$settings,
    		$letterStates
    	});

    	$$self.$inject_state = $$props => {
    		if ('stats' in $$props) $$invalidate(0, stats = $$props.stats);
    		if ('game' in $$props) $$invalidate(1, game = $$props.game);
    		if ('toaster' in $$props) $$invalidate(14, toaster = $$props.toaster);
    		if ('showTutorial' in $$props) $$invalidate(3, showTutorial = $$props.showTutorial);
    		if ('showSettings' in $$props) $$invalidate(4, showSettings = $$props.showSettings);
    		if ('showStats' in $$props) $$invalidate(5, showStats = $$props.showStats);
    		if ('showRefresh' in $$props) $$invalidate(6, showRefresh = $$props.showRefresh);
    		if ('board' in $$props) $$invalidate(7, board = $$props.board);
    		if ('timer' in $$props) $$invalidate(8, timer = $$props.timer);
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { stats: 0, game: 1, toaster: 14 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*stats*/ ctx[0] === undefined && !('stats' in props)) {
    			console.warn("<Game> was created without expected prop 'stats'");
    		}

    		if (/*game*/ ctx[1] === undefined && !('game' in props)) {
    			console.warn("<Game> was created without expected prop 'game'");
    		}

    		if (/*toaster*/ ctx[14] === undefined && !('toaster' in props)) {
    			console.warn("<Game> was created without expected prop 'toaster'");
    		}
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

    // (76:0) {#if toaster}
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
    		source: "(76:0) {#if toaster}",
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

    	if (!isNaN(parseInt(hash[1])) && parseInt(hash[1]) < getWordNumber(modeVal)) {
    		modeData.modes[modeVal].seed = (parseInt(hash[1]) - 1) * modeData.modes[modeVal].unit + modeData.modes[modeVal].start;
    		modeData.modes[modeVal].historical = true;
    	}

    	mode.subscribe(m => {
    		localStorage.setItem("mode", `${m}`);
    		$$invalidate(1, stats = JSON.parse(localStorage.getItem(`stats-${m}`)) || createDefaultStats(m));
    		$$invalidate(2, word = "tuffy");
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
