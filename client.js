window.__ModuleLoader__.load({
  id: '@local/dsh-translation',
  factory(require) {
    const {
      createElement: h,
      useCallback,
      useEffect,
      useId,
      useRef,
      useState,
      useSyncExternalStore,
    } = require('react')
    const PLUGIN_ID = 'text-translation'
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
    const MAX_SOURCE_LENGTH = 30_000
    const MAX_PROMPT_LENGTH = 8_000
    const TRANSLATION_API = '/text-translation/api'
    const REQUEST_TIMEOUT_MS = 30_000
    const LOCALE_COPY = {
      zh: {
        title: '翻译',
        target: '译为',
        source: '原文',
        result: '译文',
        sourcePlaceholder: '输入或粘贴原文',
        resultPlaceholder: '译文将在这里显示',
        translate: '翻译',
        translating: '正在翻译…',
        languageLocale: 'zh-CN',
        prompt: '翻译提示词',
        promptHint: '用 {targetLanguage} 表示所选目标语言，翻译时会替换为语言名称。',
        save: '保存',
        reset: '恢复默认',
        saved: '已保存',
        loading: '正在加载设置…',
        unavailable: '当前无法读取翻译设置。',
        saveFailed: '保存失败，请重试。',
        failed: '翻译失败，请检查所选模型的配置后重试。',
        truncated: '译文超过模型输出上限，请分段翻译。',
        timeout: '翻译超时，请重试。',
        unauthorized: '当前连接无权发起翻译。',
        model: '模型',
        followDefault: '跟随默认',
        modelSearch: '搜索模型',
        thinkingEffort: '思考强度',
        providerDefault: '默认',
        accountGroup: 'DeepSeek 账号',
        catalogLoading: '正在加载模型…',
        catalogFailed: '无法加载 DSH 模型列表。',
        retry: '重试',
        noModels: '没有可用的模型。',
        noModelMatches: '没有匹配的模型。',
        modelSaveFailed: '模型设置保存失败，请重试。',
      },
      en: {
        title: 'Translation',
        target: 'Translate to',
        source: 'Source text',
        result: 'Translation',
        sourcePlaceholder: 'Type or paste the source text',
        resultPlaceholder: 'The translation will appear here',
        translate: 'Translate',
        translating: 'Translating…',
        languageLocale: 'en',
        prompt: 'Translation prompt',
        promptHint: 'Use {targetLanguage} to insert the name of the selected language.',
        save: 'Save',
        reset: 'Restore default',
        saved: 'Saved',
        loading: 'Loading settings…',
        unavailable: 'Translation settings are unavailable.',
        saveFailed: 'Could not save. Try again.',
        failed: 'Translation failed. Check the selected model and try again.',
        truncated: 'The translation exceeded the model output limit. Try translating shorter sections.',
        timeout: 'Translation timed out. Try again.',
        unauthorized: 'This connection cannot submit translations.',
        model: 'Model',
        followDefault: 'Follow DSH default',
        modelSearch: 'Search models',
        thinkingEffort: 'Reasoning effort',
        providerDefault: 'Default',
        accountGroup: 'DeepSeek Account',
        catalogLoading: 'Loading models…',
        catalogFailed: 'Could not load the DSH model catalog.',
        retry: 'Retry',
        noModels: 'No models available.',
        noModelMatches: 'No matching models.',
        modelSaveFailed: 'Could not save the model. Try again.',
      },
    }

    const STYLES = `
      .dtr-page, .dtr-settings {
        color: var(--dsw-alias-label-primary, #171717);
        font: 16px / 24px Geist, "Geist Fallback", "PingFang SC", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif;
      }
      .dtr-page {
        display: flex;
        flex-direction: column;
        gap: 28px;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding: 32px clamp(20px, 5vw, 72px);
        overflow: auto;
        background: var(--dsw-alias-bg-canvas, #fff);
      }
      .dtr-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0;
        font-size: 28px;
        line-height: 1.2;
        font-weight: 700;
        letter-spacing: -.03em;
      }
      .dtr-toolbar, .dtr-actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
      }
      .dtr-toolbar label, .dtr-field label {
        font-size: 14px;
        font-weight: 600;
      }
      .dtr-model {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        margin-inline-start: auto;
      }
      .dtr-model > label {
        flex: none;
        white-space: nowrap;
      }
      .dtr-model-picker {
        position: relative;
        min-width: 0;
      }
      .dtr-control.dtr-model-trigger {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-width: min(210px, 100%);
        max-width: min(320px, 100%);
        padding: 0 14px;
        border-color: #e5e5e5;
        color: #171717;
        font-weight: 500;
        background: linear-gradient(#fff, #fafafa);
        box-shadow: 0 1px 2px #0000000d;
        text-align: start;
        transition: all 150ms cubic-bezier(.4, 0, .2, 1);
      }
      .dtr-model-trigger-text {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        line-height: 18px;
      }
      .dtr-model-trigger-name, .dtr-model-trigger-group, .dtr-model-trigger-effort {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dtr-model-trigger-name {
        flex: 1 1 auto;
      }
      .dtr-model-trigger-group {
        max-width: 30%;
        color: #666;
        font-size: 12px;
        font-weight: 400;
      }
      .dtr-model-trigger-effort {
        flex: 0 0 auto;
        max-width: 35%;
        padding: 1px 6px;
        border-radius: 6px;
        background: #eff1fc;
        color: #394bb0;
        font-size: 12px;
      }
      .dtr-model-trigger .dtr-chevron {
        flex-shrink: 0;
        margin-inline-end: 2px;
        color: #666;
      }
      .dtr-model-menu {
        inset-inline-end: 0;
        width: min(360px, calc(100vw - 48px));
      }
      .dtr-dropdown-menu:is(.dtr-model-menu, .dtr-effort-menu) {
        box-sizing: border-box;
        padding: 8px;
        border: 1px solid #e7e7eb;
        background: #fff;
        box-shadow: 0 2px 6px rgb(21 24 40 / 5%), 0 12px 28px rgb(21 24 40 / 9%);
        font-family: var(--dsw-font-family, inherit);
      }
      .dtr-model-menu.dtr-dropdown-menu {
        overflow: visible;
      }
      .dtr-model-section {
        display: grid;
        gap: 4px;
      }
      .dtr-model-list {
        min-height: 0;
        overflow: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: #d9d9de transparent;
        padding: 2px;
      }
      .dtr-effort-picker {
        position: relative;
        flex: none;
        padding: 6px 2px 2px;
        border-block-start: 1px solid #efeff2;
      }
      .dtr-effort-menu.dtr-dropdown-menu {
        inset-block-start: auto;
        inset-block-end: 0;
        inset-inline-end: calc(100% + 12px);
        width: 168px;
        overscroll-behavior: contain;
      }
      @media (max-width: 760px) {
        .dtr-effort-menu.dtr-dropdown-menu {
          inset-block-end: calc(100% + 4px);
          inset-inline-end: 0;
        }
      }
      .dtr-model-submenu-value {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #585c69;
      }
      .dtr-model-effort-value {
        padding: 1px 7px;
        border-radius: 7px;
        background: #fff;
        color: #474b60;
        font-size: 12px;
        overflow-wrap: anywhere;
      }
      .dtr-model-group-title, .dtr-model-status {
        padding: 4px 8px;
        color: #666978;
        font-size: 12px;
        line-height: 18px;
        overflow-wrap: anywhere;
      }
      .dtr-model-group-title {
        font-weight: 600;
      }
      .dtr-model-group {
        display: grid;
        gap: 2px;
        overflow-wrap: anywhere;
      }
      .dtr-model-group + .dtr-model-group {
        margin-block-start: 3px;
        padding-block-start: 4px;
        border-block-start: 1px solid #efeff2;
      }
      .dtr-model-menu .dtr-dropdown-option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 34px;
        padding: 6px 9px;
        border-radius: 9px;
      }
      .dtr-model-menu .dtr-effort-entry {
        background: #f6f6f8;
        font-weight: 500;
      }
      .dtr-model-menu .dtr-effort-entry:is(:hover, [aria-expanded=true]) {
        background: #eeeef6;
      }
      .dtr-model-menu .dtr-dropdown-option[aria-pressed=true] {
        color: #394bb0;
        font-weight: 500;
        background: #eff1fc;
      }
      .dtr-model-menu .dtr-dropdown-option:focus-visible {
        outline: 2px solid #7885dc;
        outline-offset: -2px;
      }
      .dtr-model-check {
        flex: none;
        color: #4659c4;
      }
      .dtr-model-search-box {
        flex: none;
        padding: 2px 2px 5px;
      }
      .dtr-model-search {
        box-sizing: border-box;
        width: 100%;
        min-height: 36px;
        padding: 5px 10px;
        border: 1px solid #e9e9ef;
        border-radius: 9px;
        color: inherit;
        background: #fafafb;
        font: inherit;
        font-size: 13px;
      }
      .dtr-model-search::placeholder {
        color: #6b6d7a;
      }
      .dtr-model-search:focus-visible {
        outline: 2px solid #7885dc;
        outline-offset: -2px;
      }
      .dtr-control {
        box-sizing: border-box;
        min-height: 44px;
        padding: 0 20px;
        border: 1px solid #dbdbdb;
        border-radius: 16px;
        color: inherit;
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        background: linear-gradient(#fff, #f7f7f7);
        box-shadow: 0 1px 2px rgb(0 0 0 / 7%);
      }
      .dtr-control:is(button, select) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .dtr-language {
        position: relative;
      }
      .dtr-control.dtr-language-trigger {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        min-width: 194px;
        padding: 0 20px;
        border-color: #e5e5e5;
        color: inherit;
        font-weight: 400;
        background: linear-gradient(#fff, #fafafa);
        box-shadow: 0 1px 2px #0000000d;
        text-align: start;
        transition: all 150ms cubic-bezier(.4, 0, .2, 1);
      }
      .dtr-control:is(.dtr-language-trigger, .dtr-model-trigger):not(:disabled, [aria-disabled=true]):hover, .dtr-control:is(.dtr-language-trigger, .dtr-model-trigger)[aria-expanded=true] {
        filter: brightness(.98);
      }
      .dtr-control:is(.dtr-language-trigger, .dtr-model-trigger):not(:disabled, [aria-disabled=true]):active {
        transform: translateY(1px);
        box-shadow: inset 0 1px 2px #0000001a;
      }
      .dtr-chevron {
        width: 7px;
        height: 7px;
        border-inline-end: 2px solid currentColor;
        border-block-end: 2px solid currentColor;
        transform: rotate(45deg) translateY(-2px);
      }
      .dtr-language-menu {
        inset-inline: 0;
      }
      .dtr-dropdown-menu {
        position: absolute;
        z-index: 20;
        inset-block-start: calc(100% + 6px);
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: min(26rem, 70vh);
        overflow: auto;
        padding: 6px;
        border: 0;
        border-radius: 16px;
        color: #070707;
        background: #fff;
        box-shadow: 0 0 0 1px rgb(0 0 0 / 10%), 0 4px 6px -1px rgb(0 0 0 / 10%), 0 2px 4px -2px rgb(0 0 0 / 10%);
        scrollbar-width: thin;
        scrollbar-color: #d9d9d9 transparent;
        animation: dtr-menu-in 150ms cubic-bezier(.4, 0, .2, 1);
      }
      @keyframes dtr-menu-in {
        from {
          opacity: 0;
          transform: translateY(-8px) scale(.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .dtr-dropdown-menu::-webkit-scrollbar {
        width: 8px;
      }
      .dtr-dropdown-menu::-webkit-scrollbar-track {
        background: transparent;
      }
      .dtr-dropdown-menu::-webkit-scrollbar-thumb {
        min-height: 48px;
        border: 2px solid transparent;
        border-radius: 999px;
        background: #d9d9d9;
        background-clip: content-box;
      }
      .dtr-dropdown-menu::-webkit-scrollbar-thumb:hover {
        background: #bdbdbd;
        background-clip: content-box;
      }
      .dtr-dropdown-option {
        box-sizing: border-box;
        display: block;
        flex: 0 0 auto;
        width: 100%;
        padding: 4px 6px;
        border: 0;
        border-radius: 13px;
        color: #070707;
        background: transparent;
        font: inherit;
        font-size: 14px;
        line-height: 20px;
        text-align: start;
        cursor: pointer;
        transition: all 150ms cubic-bezier(.4, 0, .2, 1);
      }
      .dtr-dropdown-option:hover, .dtr-dropdown-option:focus-visible {
        background: #f5f5f5;
        color: #141414;
        outline: none;
      }
      .dtr-dropdown-option[aria-selected=true] {
        color: #070707;
        font-weight: 500;
      }
      .dtr-primary {
        box-sizing: border-box;
        min-height: 44px;
        padding-inline: 16px;
        border: 1px solid transparent;
        border-radius: 16px;
        color: #fff;
        background: linear-gradient(#333, #121214);
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        box-shadow: inset 0 1px rgb(255 255 255 / 18%), 0 1px 2px rgb(0 0 0 / 20%);
        transition: all 150ms cubic-bezier(.4, 0, .2, 1);
      }
      .dtr-primary:not(:disabled):hover {
        filter: brightness(.98);
      }
      .dtr-primary:not(:disabled):active {
        transform: translateY(1px);
        box-shadow: inset 0 1px 2px #0000001a;
      }
      .dtr-control:is(:disabled, [aria-disabled=true]) {
        opacity: .5;
        cursor: default;
      }
      .dtr-control:focus-visible {
        outline: 3px solid rgb(77 107 254 / 20%);
        outline-offset: 2px;
      }
      .dtr-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        flex: 1;
        gap: 20px;
      }
      .dtr-field {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
      }
      .dtr-text {
        display: block;
        width: 100%;
        flex: 1;
        min-height: 14rem;
        padding: 16px 18px;
        resize: vertical;
        line-height: 1.6;
        border-radius: 22px;
        background: var(--dsw-alias-bg-layer-1, #fff);
      }
      .dtr-page .dtr-text {
        font-family: var(--dsw-font-family, inherit);
      }
      .dtr-output {
        background: var(--dsw-alias-bg-layer-2, #fafafa);
      }
      .dtr-text::placeholder, .dtr-hint {
        color: var(--dsw-alias-label-secondary, #777);
      }
      .dtr-error {
        color: var(--dsw-alias-state-error-primary, #c33);
        margin: 0;
        font-size: 13px;
      }
      .dtr-settings {
        display: grid;
        gap: 16px;
        max-width: 760px;
      }
      .dtr-settings .dtr-text {
        min-height: 9rem;
      }
      .dtr-hint {
        margin: 0;
        font-size: 13px;
      }
      @media (prefers-reduced-motion: reduce) {
        .dtr-dropdown-menu, .dtr-dropdown-option {
          animation: none;
          transition: none;
        }
      }
      @media (max-width: 760px) {
        .dtr-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .dtr-model {
          margin-inline-start: 0;
        }
        .dtr-model-menu {
          inset-inline: 0 auto;
        }
      }
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
      const reload = useCallback(() => refresh(previous => previous + 1), [])

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
      useEffect(() => modelUi.subscribeCatalog(reload), [modelUi, reload])
      return { ...catalog, reload }
    }

    function TranslationModel({ form, modelUi, locked, pending, setPending, t }) {
      const snapshot = useConfig(form)
      const catalog = useCatalog(modelUi)
      const [saveFailed, setSaveFailed] = useState(false)
      const [open, setOpen] = useState(false)
      const [effortOpen, setEffortOpen] = useState(false)
      const [query, setQuery] = useState('')
      const root = useRef(null)
      const trigger = useRef(null)
      const menu = useRef(null)
      const effortEntry = useRef(null)
      const effortMenu = useRef(null)
      const triggerId = useId()
      const menuId = useId()
      const effortMenuId = useId()
      const selected = snapshot.value?.selection
      const current = selected ?? catalog.value?.default
      const groups = catalog.value?.groups ?? []
      const group = groups.find(group => group.id === current?.provider)
      const model = group?.models.find(model => model.id === current?.model)
      const providerName = provider => provider.id === 'deepseek-account' ? t('accountGroup') : provider.name
      const reasoning = model?.reasoning
      const effort = current?.reasoningEffort ?? reasoning?.defaultEffort
      const effortLabel = effort === undefined
        ? reasoning && t('providerDefault')
        : reasoning?.efforts.find(level => level.id === effort)?.name ?? effort
      const efforts = reasoning ? [...reasoning.efforts] : []
      if (reasoning && reasoning.defaultEffort === undefined) {
        efforts.unshift({ id: undefined, name: t('providerDefault') })
      }
      const showEffort = effortOpen && efforts.length > 0
      const currentName = model?.name ?? current?.model ?? t('followDefault')
      const currentGroupName = group ? providerName(group) : current?.provider
      const currentLabel = [currentName, currentGroupName, effortLabel].filter(Boolean).join(' · ')
      const disabled = locked || pending || !snapshot.writable
      const search = query.trim().toLowerCase()
      const visibleGroups = groups.map(group => ({
        ...group,
        models: group.models.filter(model => !search || [providerName(group), model.name, model.id]
          .some(value => value.toLowerCase().includes(search))),
      })).filter(group => group.models.length > 0)

      useEffect(() => {
        if (!open) return undefined
        const closeOutside = event => {
          if (!root.current?.contains(event.target)) setOpen(false)
          if (!effortEntry.current?.contains(event.target) && !effortMenu.current?.contains(event.target)) setEffortOpen(false)
        }
        document.addEventListener('pointerdown', closeOutside)
        return () => document.removeEventListener('pointerdown', closeOutside)
      }, [open])
      useEffect(() => {
        const popup = menu.current
        if (!open || !popup) return
        popup.focus({ preventScroll: true })
        const handleWheel = event => {
          if (event.ctrlKey) return
          if (!event.target.closest('.dtr-model-list, .dtr-effort-menu')) event.preventDefault()
        }
        popup.addEventListener('wheel', handleWheel, { passive: false })
        return () => popup.removeEventListener('wheel', handleWheel)
      }, [open])
      useEffect(() => {
        if (!open || !showEffort) return
        const target = effortMenu.current?.querySelector('[aria-pressed=true]') ?? effortMenu.current?.querySelector('button')
        target?.focus({ preventScroll: true })
      }, [open, showEffort])
      useEffect(() => {
        if (disabled) setOpen(false)
      }, [disabled])

      function closeMenu() {
        setOpen(false)
        trigger.current?.focus()
      }

      function toggleMenu() {
        if (disabled) return
        if (open) return closeMenu()
        setQuery('')
        setEffortOpen(false)
        setOpen(true)
      }

      function closeEffort() {
        setEffortOpen(false)
        effortEntry.current?.focus({ preventScroll: true })
      }

      function handleMenuKey(event) {
        const inEffort = effortMenu.current?.contains(event.target)
        if (event.key === 'Escape' || (inEffort && event.key === 'ArrowLeft')) {
          event.preventDefault()
          event.stopPropagation()
          if (showEffort) closeEffort()
          else closeMenu()
          return
        }
        if (event.key === 'ArrowRight' && event.target === effortEntry.current) {
          event.preventDefault()
          setEffortOpen(true)
          return
        }
        const { key, target } = event
        if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return
        if (target.tagName === 'INPUT' && (key === 'Home' || key === 'End')) return
        const scope = inEffort ? effortMenu.current : menu.current
        const options = [...scope.querySelectorAll('button:not(:disabled)')]
          .filter(button => inEffort || !effortMenu.current?.contains(button))
        if (!options.length) return
        event.preventDefault()
        const index = options.indexOf(target)
        if (key === 'Home') options[0].focus()
        else if (key === 'End') options.at(-1).focus()
        else if (key === 'ArrowDown') options[(index + 1) % options.length].focus()
        else options[index < 0 ? options.length - 1 : (index - 1 + options.length) % options.length].focus()
      }

      async function choose(selection) {
        if (disabled) return
        if (open) closeMenu()
        setPending(true)
        setSaveFailed(false)
        try {
          const accepted = await form.set('selection', selection)
          if (accepted) return
        } catch {
          // 设置服务会恢复上一次已接受的配置。
        } finally {
          setPending(false)
        }
        setSaveFailed(true)
      }

      function option(label, key, checked, apply, dismiss = closeMenu) {
        return h('button', { key, className: 'dtr-dropdown-option', type: 'button', 'aria-pressed': checked,
          onClick: checked ? dismiss : apply }, label,
        checked && h('span', { className: 'dtr-model-check', 'aria-hidden': true }, '✓'))
      }

      function renderModelList() {
        return h('div', { className: 'dtr-model-section dtr-model-list' },
          catalog.status === 'loading' && h('div', { className: 'dtr-model-status', role: 'status' }, t('catalogLoading')),
          catalog.status === 'error' && h('div', null,
            h('div', { className: 'dtr-model-status', role: 'status' }, t('catalogFailed')),
            h('button', {
              className: 'dtr-dropdown-option',
              type: 'button',
              onClick: () => {
                menu.current?.focus()
                catalog.reload()
              },
            }, t('retry'))),
          catalog.status === 'ready' && visibleGroups.length === 0 && h('div', {
            className: 'dtr-model-status',
            role: 'status',
          }, t(search ? 'noModelMatches' : 'noModels')),
          catalog.value?.failures?.map(failure => h('div', {
            key: failure.id,
            className: 'dtr-model-status',
            role: 'status',
          }, providerName(failure), ' · ', failure.message)),
          visibleGroups.map(group => {
            const name = providerName(group)
            return h('div', { key: group.id, className: 'dtr-model-group', role: 'group', 'aria-label': name },
              h('div', { className: 'dtr-model-group-title' }, name),
              group.models.map(model => {
                const checked = group.id === current?.provider && model.id === current?.model
                return option(model.name, model.id, checked, () => void choose({ provider: group.id, model: model.id }))
              }))
          }))
      }

      function renderEffortPicker() {
        if (efforts.length === 0) return null
        return h('div', { className: 'dtr-model-section dtr-effort-picker' },
          h('button', {
            className: 'dtr-dropdown-option dtr-effort-entry',
            type: 'button',
            ref: effortEntry,
            'aria-expanded': showEffort,
            'aria-controls': showEffort ? effortMenuId : undefined,
            onClick: () => showEffort ? closeEffort() : setEffortOpen(true),
          }, t('thinkingEffort'), h('span', { className: 'dtr-model-submenu-value' },
            h('span', { className: 'dtr-model-effort-value' }, effortLabel),
            h('span', { 'aria-hidden': true }, '▾'))),
          showEffort && h('div', {
            id: effortMenuId,
            className: 'dtr-dropdown-menu dtr-effort-menu',
            role: 'group',
            'aria-label': t('thinkingEffort'),
            ref: effortMenu,
          }, efforts.map(level => option(level.name, level.id ?? 'provider-default', level.id === effort, () => {
            const selection = { provider: current.provider, model: current.model }
            if (level.id !== undefined) selection.reasoningEffort = level.id
            void choose(selection)
          }, closeEffort))))
      }

      const labelId = triggerId + '-label'
      const valueId = triggerId + '-value'
      const triggerButton = h('button', {
        id: triggerId,
        className: 'dtr-control dtr-model-trigger',
        type: 'button',
        ref: trigger,
        'aria-labelledby': labelId + ' ' + valueId,
        'aria-disabled': disabled,
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        'aria-controls': open ? menuId : undefined,
        title: currentLabel,
        onClick: toggleMenu,
        onKeyDown: event => {
          if (!disabled && !open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault()
            toggleMenu()
          }
        },
      }, h('span', { id: valueId, className: 'dtr-model-trigger-text' },
          h('span', { className: 'dtr-model-trigger-name' }, currentName),
          currentGroupName && h('span', { className: 'dtr-model-trigger-group' }, currentGroupName),
          effortLabel && h('span', { className: 'dtr-model-trigger-effort' }, effortLabel)),
        h('span', { className: 'dtr-chevron', 'aria-hidden': true }))
      const popup = open && h('div', {
        id: menuId,
        className: 'dtr-dropdown-menu dtr-model-menu',
        role: 'dialog',
        'aria-label': t('model'),
        ref: menu,
        tabIndex: -1,
        onKeyDown: handleMenuKey,
      },
        groups.length > 0 && h('div', { className: 'dtr-model-search-box' },
          h('input', {
            className: 'dtr-model-search',
            type: 'search',
            value: query,
            placeholder: t('modelSearch'),
            'aria-label': t('modelSearch'),
            onChange: event => setQuery(event.target.value),
            onKeyDown: event => {
              if (event.key === 'Enter') event.preventDefault()
            },
          })),
        renderModelList(),
        renderEffortPicker())

      return h('div', { className: 'dtr-model' },
        h('label', { id: labelId, htmlFor: triggerId }, t('model')),
        h('div', {
          className: 'dtr-model-picker',
          ref: root,
          onBlur: event => {
            if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false)
          },
        },
          triggerButton,
          popup),
        saveFailed && h('span', { className: 'dtr-error', role: 'alert' }, t('modelSaveFailed')))
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
        open && h('div', { className: 'dtr-dropdown-menu dtr-language-menu', role: 'listbox', 'aria-label': label },
          LANGUAGES.map(code => h('button', { key: code, className: 'dtr-dropdown-option', type: 'button',
            role: 'option', 'aria-selected': code === value,
            onClick: () => { onChange(code); setOpen(false) } }, names.of(code)))))
    }

    // 草稿由插件持有，页面卸载后仍保留；同步写入以保留最后一个流式片段。
    function useDraftState(draft, key) {
      const [value, setValue] = useState(() => draft[key])
      const update = next => {
        const value = typeof next === 'function' ? next(draft[key]) : next
        draft[key] = value
        setValue(value)
      }
      return [value, update]
    }

    function translationError(code) {
      return ['timeout', 'truncated', 'unauthorized'].includes(code) ? code : 'failed'
    }

    async function streamTranslation(input, signal, onText, onError) {
      const response = await fetch(TRANSLATION_API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
        signal,
      })
      if (!response.ok || !response.body) {
        const { error } = await response.json().catch(() => ({})) ?? {}
        signal.throwIfAborted()
        onError(translationError(error))
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      try {
        while (true) {
          const { value, done } = await reader.read()
          signal.throwIfAborted()
          buffer += decoder.decode(value, { stream: !done })
          const frames = buffer.split('\n\n')
          buffer = frames.pop()
          for (const frame of frames) {
            const data = frame.split('\n').find(line => line.startsWith('data: '))
            if (!data) continue
            const event = JSON.parse(data.slice(6))
            if (event.type === 'text' && typeof event.text === 'string') onText(event.text)
            if (event.type === 'error') {
              onError(translationError(event.error))
              return
            }
            if (event.type === 'done') return
          }
          if (done) return
        }
      } finally {
        reader.releaseLock()
      }
    }

    function TranslationPage({ t, form, modelUi, draft }) {
      const [target, setTarget] = useDraftState(draft, 'target')
      const [source, setSource] = useDraftState(draft, 'source')
      const [result, setResult] = useDraftState(draft, 'result')
      const [error, setError] = useState(null)
      const [pending, setPending] = useState(false)
      const [modelPending, setModelPending] = useState(false)
      const request = useRef(null)
      const field = useId()
      const names = new Intl.DisplayNames([t('languageLocale')], { type: 'language' })
      useEffect(() => () => {
        request.current?.abort()
        request.current = null
      }, [])

      async function submit(event) {
        event.preventDefault()
        if (request.current || modelPending || !source.trim()) return
        const controller = new AbortController()
        let timedOut = false
        const timeout = setTimeout(() => {
          timedOut = true
          controller.abort()
        }, REQUEST_TIMEOUT_MS)
        request.current = controller
        setPending(true)
        setError(null)
        setResult('')
        try {
          await streamTranslation({ target, text: source }, controller.signal, setResult, setError)
        } catch {
          if (request.current === controller) setError(timedOut ? 'timeout' : 'failed')
        } finally {
          clearTimeout(timeout)
          if (request.current === controller) {
            request.current = null
            setPending(false)
          }
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
          h('button', { className: 'dtr-control dtr-primary', type: 'submit', disabled: pending || modelPending || !source.trim() },
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
        const draft = { target: 'en', source: '', result: '' }
        const modelUi = {
          loadCatalog: () => ctx.remote.session.modelCatalog(),
          subscribeCatalog(listener) {
            const dispose = CATALOG_EVENTS.map(event => ctx.remote.$on(event, listener))
            dispose.push(ctx.on('connection/reset', listener))
            return () => dispose.forEach(remove => remove())
          },
        }
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: PLUGIN_ID, locale: PLUGIN_ID, inject: () => ({ t, form, modelUi, draft }),
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
