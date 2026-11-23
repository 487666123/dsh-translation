window.__ModuleLoader__.load({
  id: '@local/dsh-translation',
  factory(require) {
    const { createElement: h, useId, useEffect, useRef, useState, useSyncExternalStore } = require('react')
    const id = 'text-translation'
    const modelSlot = 'conversation.input.model'
    const catalogEvents = ['llm/adapters-updated', 'llm/models-updated', 'settings/document-updated',
      'credentials/record-updated', 'credentials/reference-updated']
    const languages = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'it', 'ru', 'ar', 'hi', 'id', 'vi', 'th', 'nl', 'tr', 'uk']
    const copy = {
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

    const styles = `
      .dtr-page, .dtr-settings { color: var(--dsw-alias-label-primary); font: inherit; }
      .dtr-page { display: flex; flex-direction: column; gap: 20px; box-sizing: border-box;
        width: 100%; height: 100%; padding: 24px clamp(16px, 3vw, 36px); overflow: auto; }
      .dtr-title { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 20px; font-weight: 600; }
      .dtr-toolbar, .dtr-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
      .dtr-toolbar label, .dtr-field label, .dtr-model-label { font-size: 14px; font-weight: 600; }
      .dtr-model { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-inline-start: auto; }
      .dtr-control { box-sizing: border-box; min-height: 34px; padding: 5px 12px; border-radius: 8px;
        border: 1px solid var(--dsw-alias-border-l1); color: inherit; font: inherit; font-size: 14px;
        background: var(--dsw-alias-bg-layer-1); }
      .dtr-control:is(button, select) { cursor: pointer; }
      .dtr-primary { color: white; background: var(--dsw-alias-brand-primary, #4d6bfe); border-color: transparent; }
      .dtr-control:disabled { opacity: .55; cursor: default; }
      .dtr-control:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe); outline-offset: 2px; }
      .dtr-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); flex: 1; gap: 16px; }
      .dtr-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
      .dtr-text { display: block; width: 100%; flex: 1; min-height: 12rem; padding: 12px 14px;
        resize: vertical; line-height: 1.55; border-radius: 12px; }
      .dtr-output { background: var(--dsw-alias-bg-layer-2); }
      .dtr-text::placeholder, .dtr-hint { color: var(--dsw-alias-label-secondary); }
      .dtr-error { color: var(--dsw-alias-state-error-primary); margin: 0; font-size: 13px; }
      .dtr-settings { display: grid; gap: 14px; max-width: 760px; }
      .dtr-settings .dtr-text { min-height: 9rem; }
      .dtr-hint { margin: 0; font-size: 13px; }
      @media (max-width: 760px) { .dtr-grid { grid-template-columns: minmax(0, 1fr); } }
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

    function TranslationModel({ form, modelUi, locked, pending, setPending, t }) {
      const snapshot = useConfig(form)
      const Picker = useSyncExternalStore(modelUi.subscribePicker, modelUi.getPicker)
      const catalog = useCatalog(modelUi)
      const [resetFailed, setResetFailed] = useState(false)
      const selected = snapshot.value?.selection
      const state = {
        current: selected ?? catalog.value?.default ?? null,
        groups: catalog.value?.groups ?? [], failures: catalog.value?.failures ?? [],
        status: catalog.status, error: catalog.status === 'error' ? t('catalogFailed') : null, pending,
      }
      const directory = { subscribe: () => () => {}, getSnapshot: () => state }
      const disabled = locked || pending !== null || !snapshot.writable

      async function choose(selection) {
        if (disabled) return
        setPending(selection ?? selected)
        setResetFailed(false)
        try {
          const accepted = selection
            ? await form.set('selection', selection)
            : await form.unset('selection')
          if (accepted) return { ok: true }
        } catch {
          // 设置服务会恢复上一次已接受的配置。
        } finally {
          setPending(null)
        }
        if (selection) return { ok: false, error: { code: 'translation/model', message: t('modelSaveFailed') } }
        setResetFailed(true)
      }

      // 复用会话里的模型选择组件，将选择保存到翻译自己的设置。
      return h('div', { className: 'dtr-model', role: 'group', 'aria-label': t('model') },
        h('span', { className: 'dtr-model-label' }, t('model')),
        Picker ? h(Picker, {
          available: true, locked: disabled, directory, load: catalog.load, select: choose,
          t: modelUi.t, resolveText: modelUi.resolveText, renderSlot: (_slot, _props, options) => options?.fallback,
        }) : h('span', { className: 'dtr-hint' }, t('pickerUnavailable')),
        selected && h('button', { className: 'dtr-control', type: 'button', disabled,
          onClick: () => void choose(null) }, t('followDefault')),
        resetFailed && h('span', { className: 'dtr-error', role: 'alert' }, t('modelSaveFailed')))
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

      return h('form', { className: 'dtr-page', onSubmit: submit },
        h('h1', { className: 'dtr-title' }, h(Icon, { size: 24 }), t('title')),
        h('div', { className: 'dtr-toolbar' },
          h('label', { htmlFor: field + '-target' }, t('target')),
          h('select', { className: 'dtr-control', id: field + '-target', value: target, disabled: pending,
            onChange: event => { setTarget(event.target.value); clearResult() } },
          languages.map(code => h('option', { key: code, value: code }, names.of(code)))),
          h('button', { className: 'dtr-control dtr-primary', type: 'submit', disabled: pending || modelPending !== null || !source.trim() },
            t(pending ? 'translating' : 'translate')),
          h(TranslationModel, { form, modelUi, t, locked: pending, pending: modelPending, setPending: setModelPending })),
        error && h('p', { className: 'dtr-error', role: 'alert' }, t(error)),
        h('div', { className: 'dtr-grid', 'aria-busy': pending },
          h('div', { className: 'dtr-field' },
            h('label', { htmlFor: field + '-source' }, t('source')),
            h('textarea', { className: 'dtr-control dtr-text', id: field + '-source', value: source,
              placeholder: t('sourcePlaceholder'), maxLength: 30000, readOnly: pending,
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
            'aria-describedby': field + '-hint', maxLength: 8000, readOnly: disabled,
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
        ctx.effect(() => ctx.locale.register(id, copy), 'text-translation: locale')
        ctx.effect(() => {
          const sheet = document.createElement('style')
          sheet.textContent = styles
          document.head.append(sheet)
          return () => sheet.remove()
        }, 'text-translation: styles')
        const t = ctx.locale.bind(id)
        const form = ctx.configForms.get(id)
        const modelUi = {
          subscribePicker: listener => ctx.slots.subscribe(modelSlot, listener),
          getPicker: () => ctx.slots.entries(modelSlot).find(entry => entry.locale === 'model')?.component,
          loadCatalog: () => ctx.remote.session.modelCatalog(),
          subscribeCatalog(listener) {
            const dispose = catalogEvents.map(event => ctx.remote.$on(event, listener))
            dispose.push(ctx.on('connection/reset', listener))
            return () => dispose.forEach(remove => remove())
          },
          t: ctx.locale.bind('model'), resolveText: text => ctx.locale.resolveText(text),
        }
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: id, locale: id, inject: () => ({ t, form, modelUi }),
        }, TranslationPage))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id, order: 25, locale: id, label: () => t('title'),
        }, Icon))
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section', id, order: 35, locale: id, label: () => t('title'),
          inject: () => ({ form, t }),
        }, TranslationSettings))
        ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
          name: 'settings.section.icon', id,
        }, Icon))
      },
    }
  },
})
