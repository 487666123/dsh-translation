window.__ModuleLoader__.load({
  id: '@local/dsh-translation',
  factory(require) {
    const {
      createElement: h,
      useEffect,
      useId,
      useRef,
      useState,
      useSyncExternalStore,
    } = require('react')
    const PLUGIN_ID = 'text-translation'
    const MODEL_SLOT = 'conversation.input.model'
    const CATALOG_EVENTS = [
      'llm/adapters-updated',
      'llm/models-updated',
      'settings/document-updated',
      'credentials/record-updated',
      'credentials/reference-updated',
    ]
    const LANGUAGES = [
      'zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'it',
      'ru', 'ar', 'hi', 'id', 'vi', 'th', 'nl', 'tr', 'uk',
    ]
    const MAX_SOURCE_LENGTH = 30000
    const MAX_PROMPT_LENGTH = 8000
    const LOCALE_COPY = {
      zh: {
        title: '翻译', target: '目标语言', source: '原文', result: '译文',
        sourcePlaceholder: '输入或粘贴原文', resultPlaceholder: '译文将在这里显示',
        translate: '翻译', translating: '正在翻译…', languageLocale: 'zh-CN',
        prompt: '翻译提示词', promptHint: '用 {targetLanguage} 表示所选目标语言，翻译时会替换为语言名称。',
        save: '保存', reset: '恢复默认', saved: '已保存', loading: '正在加载设置…', unavailable: '当前无法读取翻译设置。',
        saveFailed: '保存失败，请重试。', failed: '翻译失败，请检查所选模型的配置后重试。',
        truncated: '译文超过模型输出上限，请分段翻译。', timeout: '翻译超时，请重试。',
        unauthorized: '当前连接无权发起翻译。',
        model: '模型', followDefault: '跟随 DSH 默认模型', pickerUnavailable: '模型选择框暂不可用。',
        catalogFailed: '无法加载 DSH 模型列表。', modelSaveFailed: '模型设置保存失败，请重试。',
      },
      en: {
        title: 'Translation', target: 'Target language', source: 'Source text', result: 'Translation',
        sourcePlaceholder: 'Type or paste the source text', resultPlaceholder: 'The translation will appear here',
        translate: 'Translate', translating: 'Translating…', languageLocale: 'en',
        prompt: 'Translation prompt', promptHint: 'Use {targetLanguage} to insert the name of the selected language.',
        save: 'Save', reset: 'Restore default', saved: 'Saved', loading: 'Loading settings…', unavailable: 'Translation settings are unavailable.',
        saveFailed: 'Could not save. Try again.', failed: 'Translation failed. Check the selected model and try again.',
        truncated: 'The translation exceeded the model output limit. Try translating shorter sections.',
        timeout: 'Translation timed out. Try again.', unauthorized: 'This connection cannot submit translations.',
        model: 'Model', followDefault: 'Follow DSH default', pickerUnavailable: 'The model picker is unavailable.',
        catalogFailed: 'Could not load the DSH model catalog.', modelSaveFailed: 'Could not save the model. Try again.',
      },
    }

    const STYLES = `
      .dtr-page, .dtr-settings { color: var(--dsw-alias-label-primary, #171717); font: 16px / 24px Geist, "Geist Fallback", "PingFang SC", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif; }
      .dtr-page { display: flex; flex-direction: column; gap: 28px; box-sizing: border-box; width: 100%; height: 100%; padding: 32px clamp(20px, 5vw, 72px); overflow: auto; background: var(--dsw-alias-bg-canvas, #fff); }
      .dtr-title { display: flex; align-items: center; gap: 10px; margin: 0; font-size: 28px; line-height: 1.2; font-weight: 700; letter-spacing: -.03em; }
      .dtr-toolbar, .dtr-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
      .dtr-toolbar label, .dtr-field label, .dtr-model-label { font-size: 14px; font-weight: 600; }
      .dtr-model { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-inline-start: auto; }
      .dtr-model-picker { position: relative; }
      .dtr-dsh-picker { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; pointer-events: none; }
      .dtr-model-trigger { display: inline-flex; align-items: center; justify-content: space-between; gap: 18px; min-width: 210px; max-width: 320px; text-align: start; }
      .dtr-model-trigger-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .dtr-model-menu { position: absolute; z-index: 30; inset-block-start: calc(100% + 8px); inset-inline-end: 0; width: min(360px, 78vw); max-height: 360px; overflow: auto; padding: 8px; border: 1px solid var(--dsw-alias-border-l1, #e2e2e2); border-radius: 18px; background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: 0 14px 35px rgb(0 0 0 / 16%); scrollbar-width: thin; }
      .dtr-model-group { padding: 5px 4px 7px; }
      .dtr-model-group + .dtr-model-group { border-block-start: 1px solid var(--dsw-alias-border-l1, #ededed); }
      .dtr-model-group-title { padding: 4px 10px 6px; color: var(--dsw-alias-label-secondary, #777); font-size: 12px; font-weight: 600; }
      .dtr-model-option { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 12px; padding: 10px; border: 0; border-radius: 11px; color: inherit; background: transparent; font: inherit; font-size: 14px; text-align: start; cursor: pointer; }
      .dtr-model-option:hover, .dtr-model-option[aria-selected=true] { background: var(--dsw-alias-bg-layer-2, #f3f3f3); }
      .dtr-model-option-provider { color: var(--dsw-alias-label-secondary, #777); font-size: 12px; }
      .dtr-control { box-sizing: border-box; min-height: 44px; padding: 0 16px; border: 1px solid var(--dsw-alias-border-l1, #e2e2e2); border-radius: 16px; color: inherit; font: inherit; font-size: 14px; background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: 0 1px 2px rgb(0 0 0 / 7%); }
      .dtr-control:is(button, select) { cursor: pointer; }
      .dtr-language { position: relative; }
      .dtr-language-trigger { display: inline-flex; align-items: center; justify-content: space-between; gap: 24px; min-width: 194px; text-align: start; }
      .dtr-chevron { width: 7px; height: 7px; border-inline-end: 2px solid currentColor; border-block-end: 2px solid currentColor; transform: rotate(45deg) translateY(-2px); }
      .dtr-language-menu { position: absolute; z-index: 20; inset-block-start: calc(100% + 6px); inset-inline: 0; max-height: 320px; overflow: auto; padding: 6px; border: 1px solid var(--dsw-alias-border-l1, #e2e2e2); border-radius: 16px; background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: 0 8px 24px rgb(0 0 0 / 12%); scrollbar-width: thin; scrollbar-color: #d9d9d9 transparent; }
      .dtr-language-menu::-webkit-scrollbar { width: 8px; }
      .dtr-language-menu::-webkit-scrollbar-track { background: transparent; }
      .dtr-language-menu::-webkit-scrollbar-thumb { min-height: 48px; border: 2px solid transparent; border-radius: 999px; background: #d9d9d9; background-clip: content-box; }
      .dtr-language-menu::-webkit-scrollbar-thumb:hover { background: #bdbdbd; background-clip: content-box; }
      .dtr-language-option { display: block; width: 100%; padding: 8px 12px; border: 0; border-radius: 10px; color: inherit; background: transparent; font: inherit; font-size: 14px; text-align: start; cursor: pointer; }
      .dtr-language-option:hover, .dtr-language-option[aria-selected=true] { background: var(--dsw-alias-bg-layer-2, #f3f3f3); }
      .dtr-primary { color: #fff; background: var(--dsw-alias-brand-primary, #171717); border-color: transparent; box-shadow: inset 0 1px rgb(255 255 255 / 18%), 0 1px 2px rgb(0 0 0 / 20%); }
      .dtr-control:disabled { opacity: .5; cursor: default; }
      .dtr-control:focus-visible { outline: 3px solid rgb(77 107 254 / 20%); outline-offset: 2px; }
      .dtr-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); flex: 1; gap: 20px; }
      .dtr-field { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
      .dtr-text { display: block; width: 100%; flex: 1; min-height: 14rem; padding: 16px 18px; resize: vertical; line-height: 1.6; border-radius: 22px; background: var(--dsw-alias-bg-layer-1, #fff); }
      .dtr-output { background: var(--dsw-alias-bg-layer-2, #fafafa); }
      .dtr-text::placeholder, .dtr-hint { color: var(--dsw-alias-label-secondary, #777); }
      .dtr-error { color: var(--dsw-alias-state-error-primary, #c33); margin: 0; font-size: 13px; }
      .dtr-settings { display: grid; gap: 16px; max-width: 760px; }
      .dtr-settings .dtr-text { min-height: 9rem; }
      .dtr-hint { margin: 0; font-size: 13px; }
      @media (max-width: 760px) { .dtr-grid { grid-template-columns: minmax(0, 1fr); } .dtr-model { margin-inline-start: 0; } }
    `

    function Icon({ size = 18 }) {
      return h('svg', { viewBox: '0 0 16 16', width: size, height: size, 'aria-hidden': true },
        h('path', { d: 'M1 7.4C1 5.171 1 3.757 1.879 2.879C2.757 2 4.171 2 6.4 2L9.6 2C11.829 2 13.243 2 14.121 2.879C15 3.757 15 5.171 15 7.4L15 8.6C15 10.829 15 12.243 14.121 13.121C13.243 14 11.829 14 9.6 14L6.4 14C4.171 14 2.757 14 1.879 13.121C1 12.243 1 10.829 1 8.6Z', fill: '#BDC8FA' }),
        h('path', { d: 'M4.5 10.5V7A1.5 1.5 0 0 1 7.5 7V10.5M4.5 8.5H7.5', fill: 'none', stroke: '#5A76F2', strokeWidth: 1.25, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { d: 'M9.125 6.75C9.125 6.405 9.405 6.125 9.75 6.125L11.5 6.125C11.845 6.125 12.125 6.405 12.125 6.75L12.125 6.75C12.125 7.095 11.845 7.375 11.5 7.375L9.75 7.375C9.405 7.375 9.125 7.095 9.125 6.75Z', fill: '#5A76F2' }),
        h('path', { d: 'M9.125 9.25C9.125 8.905 9.405 8.625 9.75 8.625L11.5 8.625C11.845 8.625 12.125 8.905 12.125 9.25L12.125 9.25C12.125 9.595 11.845 9.875 11.5 9.875L9.75 9.875C9.405 9.875 9.125 9.595 9.125 9.25Z', fill: '#5A76F2' }))
    }

    function useConfig(form) {
      return useSyncExternalStore(listener => form.subscribe(listener), () => form.getSnapshot())
    }

    function useCatalog(modelUi) {
      const [catalog, setCatalog] = useState({ status: 'loading', value: null })
      const [revision, refresh] = useState(0)
      const load = () => refresh(previous => previous + 1)

      useEffect(() => {
        let current = true
        setCatalog(previous => ({ ...previous, status: 'loading' }))
        async function readCatalog() {
          try {
            const result = await modelUi.loadCatalog()
            if (!result.ok) throw new Error(result.error.message)
            if (current) setCatalog({ status: 'ready', value: result.value })
          } catch {
            if (current) setCatalog(previous => ({ ...previous, status: 'error' }))
          }
        }
        void readCatalog()
        return () => { current = false }
      }, [modelUi, revision])
      useEffect(() => modelUi.subscribeCatalog(load), [modelUi])
      return { ...catalog, load }
    }

    function modelName(item, fallback) {
      return item?.name || item?.title || item?.label || item?.model || item?.id || fallback
    }

    function TranslationModel({ form, modelUi, locked, pending, setPending, t }) {
      const snapshot = useConfig(form)
      const Picker = useSyncExternalStore(modelUi.subscribePicker, modelUi.getPicker)
      const catalog = useCatalog(modelUi)
      const [resetFailed, setResetFailed] = useState(false)
      const selected = snapshot.value?.selection
      const current = selected ?? catalog.value?.default ?? null
      const currentLabel = modelName(current, t('followDefault'))
      const state = {
        current, groups: catalog.value?.groups ?? [], failures: catalog.value?.failures ?? [],
        status: catalog.status, error: catalog.status === 'error' ? t('catalogFailed') : null, pending,
      }
      const directory = { subscribe: () => () => {}, getSnapshot: () => state }
      const disabled = locked || pending !== null || !snapshot.writable

      async function choose(selection) {
        if (disabled) return
        setPending(selection ?? selected)
        setResetFailed(false)
        try {
          const accepted = selection ? await form.set('selection', selection) : await form.unset('selection')
          if (accepted) return { ok: true }
        } catch {
          // 设置服务会恢复上一次已接受的配置。
        } finally {
          setPending(null)
        }
        if (selection) return { ok: false, error: { code: 'translation/model', message: t('modelSaveFailed') } }
        setResetFailed(true)
      }

      function openPicker(event) {
        event.preventDefault()
        if (disabled) return
        event.currentTarget.parentElement?.querySelector('.dtr-dsh-picker button')?.click()
      }

      return h('div', { className: 'dtr-model', role: 'group', 'aria-label': t('model') },
        h('span', { className: 'dtr-model-label' }, t('model')),
        h('div', { className: 'dtr-model-picker' },
          h('button', { className: 'dtr-control dtr-model-trigger', type: 'button', disabled, onClick: openPicker,
            'aria-haspopup': 'listbox' },
          h('span', { className: 'dtr-model-trigger-text' }, currentLabel),
          h('span', { className: 'dtr-chevron', 'aria-hidden': true })),
          Picker && h('div', { className: 'dtr-dsh-picker' }, h(Picker, {
            available: true, locked: disabled, directory, load: catalog.load, select: choose,
            t: modelUi.t, resolveText: modelUi.resolveText, renderSlot: (_slot, _props, options) => options?.fallback,
          }))),
        selected && h('button', { className: 'dtr-control', type: 'button', disabled, onClick: () => void choose(null) }, t('followDefault')),
        resetFailed && h('span', { className: 'dtr-error', role: 'alert' }, t('modelSaveFailed')))
    }

    function LanguageSelect({ id, value, disabled, names, onChange, label }) {
      const [open, setOpen] = useState(false)
      const root = useRef(null)
      const selectedName = names.of(value) || value
      useEffect(() => {
        if (!open) return undefined
        const close = event => { if (!root.current?.contains(event.target)) setOpen(false) }
        document.addEventListener('pointerdown', close)
        return () => document.removeEventListener('pointerdown', close)
      }, [open])
      return h('div', { className: 'dtr-language', ref: root },
        h('button', { id, className: 'dtr-control dtr-language-trigger', type: 'button', disabled,
          'aria-haspopup': 'listbox', 'aria-expanded': open, 'aria-label': label,
          onClick: () => setOpen(previous => !previous) },
        h('span', null, selectedName), h('span', { className: 'dtr-chevron', 'aria-hidden': true })),
        open && h('div', { className: 'dtr-language-menu', role: 'listbox', 'aria-label': label },
          LANGUAGES.map(code => h('button', { key: code, className: 'dtr-language-option', type: 'button',
            role: 'option', 'aria-selected': code === value,
            onClick: () => { onChange(code); setOpen(false) } }, names.of(code)))))
    }

    function TranslationPage({ t, form, modelUi }) {
      const [target, setTarget] = useState('en')
      const [source, setSource] = useState('')
      const [result, setResult] = useState('')
      const [error, setError] = useState(null)
      const [pending, setPending] = useState(false)
      const [modelPending, setModelPending] = useState(null)
      const request = useRef(null)
      const field = useId()
      const names = new Intl.DisplayNames([t('languageLocale')], { type: 'language' })
      useEffect(() => () => request.current?.abort(), [])

      async function submit(event) {
        event.preventDefault()
        if (request.current || modelPending !== null || !source.trim()) return
        const controller = new AbortController()
        request.current = controller
        setPending(true)
        setError(null)
        setResult('')
        try {
          const reply = await fetch('/text-translation/api', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ target, text: source }),
            signal: controller.signal,
          })
          const data = await reply.json()
          if (controller.signal.aborted) return
          if (reply.ok && typeof data.translated === 'string') setResult(data.translated)
          else setError(['timeout', 'truncated', 'unauthorized'].includes(data.error) ? data.error : 'failed')
        } catch {
          if (!controller.signal.aborted) setError('failed')
        } finally {
          request.current = null
          if (!controller.signal.aborted) setPending(false)
        }
      }

      function clearResult() {
        setResult('')
        setError(null)
      }

      function handleSourceKeyDown(event) {
        if (event.key !== 'Enter') return
        const input = event.currentTarget
        if (event.shiftKey) {
          event.preventDefault()
          const start = input.selectionStart
          const end = input.selectionEnd
          setSource(previous => previous.slice(0, start) + '\n' + previous.slice(end))
          clearResult()
          requestAnimationFrame(() => {
            input.selectionStart = start + 1
            input.selectionEnd = start + 1
          })
          return
        }
        event.preventDefault()
        input.form?.requestSubmit()
      }

      return h('form', { className: 'dtr-page', onSubmit: submit },
        h('h1', { className: 'dtr-title' }, h(Icon, { size: 24 }), t('title')),
        h('div', { className: 'dtr-toolbar' },
          h('label', { htmlFor: field + '-target' }, t('target')),
          h(LanguageSelect, { id: field + '-target', value: target, disabled: pending, names,
            label: t('target'), onChange: value => { setTarget(value); clearResult() } }),
          h('button', { className: 'dtr-control dtr-primary', type: 'submit', disabled: pending || modelPending !== null || !source.trim() },
            t(pending ? 'translating' : 'translate')),
          h(TranslationModel, { form, modelUi, t, locked: pending, pending: modelPending, setPending: setModelPending })),
        error && h('p', { className: 'dtr-error', role: 'alert' }, t(error)),
        h('div', { className: 'dtr-grid', 'aria-busy': pending },
          h('div', { className: 'dtr-field' },
            h('label', { htmlFor: field + '-source' }, t('source')),
            h('textarea', { className: 'dtr-control dtr-text', id: field + '-source', value: source,
              placeholder: t('sourcePlaceholder'), maxLength: MAX_SOURCE_LENGTH, readOnly: pending,
              onKeyDown: handleSourceKeyDown,
              onChange: event => { setSource(event.target.value); clearResult() } })),
          h('div', { className: 'dtr-field' },
            h('label', { htmlFor: field + '-result' }, t('result')),
            h('textarea', { className: 'dtr-control dtr-text dtr-output', id: field + '-result',
              value: result, readOnly: true, lang: target, placeholder: t('resultPlaceholder') }))))
    }

    function TranslationSettings({ form, t }) {
      const snapshot = useConfig(form)
      const [draft, setDraft] = useState(null)
      const [status, setStatus] = useState(null)
      const [pending, setPending] = useState(false)
      const field = useId()
      if (snapshot.status !== 'ready') {
        return h('p', { role: 'status' }, t(snapshot.status === 'loading' ? 'loading' : 'unavailable'))
      }
      const prompt = draft ?? snapshot.value.prompt
      const disabled = pending || !snapshot.writable

      async function save(reset) {
        setPending(true)
        setStatus(null)
        try {
          const accepted = await (reset ? form.unset('prompt') : form.set('prompt', prompt))
          if (accepted) setDraft(null)
          setStatus(accepted ? 'saved' : 'saveFailed')
        } catch {
          setStatus('saveFailed')
        } finally {
          setPending(false)
        }
      }

      return h('form', { className: 'dtr-settings', onSubmit: event => { event.preventDefault(); void save(false) } },
        h('div', { className: 'dtr-field' },
          h('label', { htmlFor: field }, t('prompt')),
          h('p', { className: 'dtr-hint', id: field + '-hint' }, t('promptHint', { targetLanguage: '{targetLanguage}' })),
          h('textarea', { className: 'dtr-control dtr-text', id: field, value: prompt,
            'aria-describedby': field + '-hint', maxLength: MAX_PROMPT_LENGTH, readOnly: disabled,
            onChange: event => { setDraft(event.target.value); setStatus(null) } })),
        h('div', { className: 'dtr-actions' },
          h('button', { className: 'dtr-control dtr-primary', type: 'submit',
            disabled: disabled || !prompt.trim() || prompt === snapshot.value.prompt }, t('save')),
          h('button', { className: 'dtr-control', type: 'button', disabled: disabled,
            onClick: () => void save(true) }, t('reset')),
          status && h('span', { className: status === 'saveFailed' ? 'dtr-error' : 'dtr-hint', role: 'status' }, t(status))))
    }

    return {
      inject: ['slots', 'locale', 'configForms', 'remote', 'remote.session'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(PLUGIN_ID, LOCALE_COPY), 'text-translation: locale')
        ctx.effect(() => {
          const sheet = document.createElement('style')
          sheet.textContent = STYLES
          document.head.append(sheet)
          return () => sheet.remove()
        }, 'text-translation: styles')
        const t = ctx.locale.bind(PLUGIN_ID)
        const form = ctx.configForms.get(PLUGIN_ID)
        const modelUi = {
          subscribePicker: listener => ctx.slots.subscribe(MODEL_SLOT, listener),
          getPicker: () => ctx.slots.entries(MODEL_SLOT).find(entry => entry.locale === 'model')?.component,
          loadCatalog: () => ctx.remote.session.modelCatalog(),
          subscribeCatalog(listener) {
            const dispose = CATALOG_EVENTS.map(event => ctx.remote.$on(event, listener))
            dispose.push(ctx.on('connection/reset', listener))
            return () => dispose.forEach(remove => remove())
          },
          t: ctx.locale.bind('model'), resolveText: text => ctx.locale.resolveText(text),
        }
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: PLUGIN_ID, locale: PLUGIN_ID, inject: () => ({ t, form, modelUi }),
        }, TranslationPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: PLUGIN_ID, order: 25, locale: PLUGIN_ID, label: () => t('title'),
        }, Icon))
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section', id: PLUGIN_ID, order: 35, locale: PLUGIN_ID, label: () => t('title'),
          inject: () => ({ form, t }),
        }, TranslationSettings))
        ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
          name: 'settings.section.icon', id: PLUGIN_ID,
        }, Icon))
      },
    }
  },
})
