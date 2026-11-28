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
        cancelTranslation: '取消翻译',
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
        thinkingEffort: '思考强度',
        providerDefault: '默认',
        accountGroup: 'DeepSeek 账号',
        catalogLoading: '正在加载模型…',
        catalogFailed: '无法加载 DSH 模型列表。',
        retry: '重试',
        noModels: '没有可用的模型。',
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
        cancelTranslation: 'Cancel translation',
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
        thinkingEffort: 'Reasoning effort',
        providerDefault: 'Default',
        accountGroup: 'DeepSeek Account',
        catalogLoading: 'Loading models…',
        catalogFailed: 'Could not load the DSH model catalog.',
        retry: 'Retry',
        noModels: 'No models available.',
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
      .dtr-model-trigger-name, .dtr-model-trigger-effort {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .dtr-model-trigger-name {
        flex: 1 1 auto;
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
        --dtr-model-row-inset: 8px;
        inset-inline-end: 0;
        width: min(240px, calc(100vw - 48px));
      }
      .dtr-model-menu.dtr-dropdown-menu {
        box-sizing: border-box;
        border: 1px solid #e7e7eb;
        background: #fff;
        box-shadow: 0 2px 6px rgb(21 24 40 / 5%), 0 12px 28px rgb(21 24 40 / 9%);
        font-family: var(--dsw-font-family, inherit);
        gap: 0;
        max-height: min(20rem, 65vh);
        padding: 0;
        overflow: visible;
      }
      .dtr-model-section {
        display: grid;
        gap: 4px;
      }
      .dtr-model-list {
        min-height: 0;
        margin: 8px;
        padding-inline-end: 6px;
        overflow: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: #d9d9de transparent;
      }
      .dtr-effort-footer {
        flex: none;
        padding: 8px;
        border-block-start: 1px solid #efeff2;
      }
      .dtr-es-sliderWrap {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: none;
      }
      .dtr-es-sliderHead {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-inline: 4px;
        font-size: 11px;
        line-height: 16px;
        color: var(--dsw-alias-label-secondary);
      }
      .dtr-es-sliderHead strong {
        color: var(--dsw-alias-label-primary);
        font-weight: 600;
      }
      .dtr-es-sliderRail {
        --slider-cycle: 5.6s;
        --slider-motion: .22s cubic-bezier(.22, .61, .36, 1);
        --slider-tint: 132 224 227;
        position: relative;
        height: 26px;
        margin: 8px 0 10px;
      }
      .dtr-es-sliderRail::before {
        content: "";
        position: absolute;
        inset: 0;
        border: 1px solid rgb(var(--slider-tint) / 28%);
        border-radius: 13px;
        box-shadow: 0 0 8px rgb(var(--slider-tint) / 16%), 0 2px 3px rgb(0 0 0 / 10%);
        opacity: var(--slider-rail-glow, .28);
        pointer-events: none;
        transition: opacity .3s ease;
      }
      .dtr-es-sliderGroove {
        position: absolute;
        inset: 0;
        isolation: isolate;
        overflow: hidden;
        border-radius: 13px;
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 32%);
        pointer-events: none;
      }
      .dtr-es-sliderGroove::before {
        content: "";
        position: absolute;
        z-index: 2;
        inset: 0 -24px;
        background:
          repeating-linear-gradient(90deg, rgb(255 255 255 / 12%) 0 1px, transparent 1px 12px),
          repeating-linear-gradient(0deg, transparent 0 5px, rgb(255 255 255 / 8%) 5px 6px, transparent 6px 12px);
        background-size: 24px 100%, 100% 12px;
        opacity: .23;
        mix-blend-mode: screen;
        animation: dtr-es-tech-grid calc(var(--slider-cycle) * 3) linear infinite;
      }
      .dtr-es-sliderGroove::after {
        content: "";
        position: absolute;
        z-index: 3;
        top: 1px;
        bottom: 1px;
        left: 0;
        width: 42%;
        background: linear-gradient(105deg, transparent 12%, rgb(var(--slider-tint) / 8%) 38%, rgb(240 255 252 / 46%) 51%, rgb(var(--slider-tint) / 14%) 58%, transparent 78%);
        opacity: 0;
        transform: translateX(-120%);
        mix-blend-mode: screen;
        animation: dtr-es-track-scan var(--slider-cycle) cubic-bezier(.4, 0, .2, 1) infinite;
      }
      .dtr-es-sliderTrack, .dtr-es-sliderFill {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        border-radius: 13px;
        pointer-events: none;
      }
      .dtr-es-sliderTrack {
        z-index: 0;
        right: 0;
        background:
          linear-gradient(180deg, rgb(255 255 255 / 12%), transparent 60%),
          linear-gradient(0deg, rgb(128 156 166 / 6%), rgb(128 156 166 / 6%)),
          Canvas;
        box-shadow: inset 0 0 0 1px rgb(128 156 166 / 12%);
      }
      .dtr-es-sliderFill {
        z-index: 1;
        overflow: hidden;
        background:
          linear-gradient(180deg, rgb(255 255 255 / 22%), transparent 42%, rgb(0 0 0 / 12%)),
          linear-gradient(90deg, #398bdd, #55b8d9 65%, #80dcd6);
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 28%), inset 0 -1px 0 rgb(18 62 100 / 18%);
        transition: width var(--slider-motion);
      }
      .dtr-es-sliderFill::before {
        content: "";
        position: absolute;
        z-index: 3;
        top: 1px;
        right: -4px;
        bottom: 1px;
        width: 16px;
        border-radius: 8px;
        background: linear-gradient(90deg, transparent, rgb(var(--slider-tint) / 44%) 54%, rgb(243 255 251 / 80%));
        opacity: var(--fill-core-opacity, .26);
        transform-origin: right center;
        animation: dtr-es-fill-core var(--slider-cycle) ease-in-out infinite;
      }
      .dtr-es-sliderFill::after {
        content: "";
        position: absolute;
        z-index: 4;
        top: 1px;
        right: 0;
        left: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent 5%, rgb(224 254 247 / 46%) 32%, rgb(255 245 220 / 74%) 76%, transparent);
        opacity: var(--fill-edge-opacity, .3);
        box-shadow: 0 0 3px rgb(var(--slider-tint) / 34%);
      }
      .dtr-es-sliderBloom {
        position: absolute;
        z-index: 0;
        inset: 0;
        background:
          linear-gradient(180deg, rgb(255 255 255 / 16%), transparent 42%, rgb(20 62 104 / 12%)),
          linear-gradient(90deg, #429be5 0%, #63ccd6 45%, #93d9d4 70%, #a49bdc 100%);
        background-size: 100% 100%, 200% 100%;
        background-position: 0 0, 0% 50%;
        opacity: var(--fill-bloom-opacity, .2);
        transition: opacity .4s ease;
      }
      .dtr-es-sliderBloom::before {
        content: "";
        position: absolute;
        inset: 0 -36px;
        background: repeating-linear-gradient(110deg, transparent 0 18px, rgb(255 255 255 / 14%) 18px 19px, transparent 19px 36px);
        background-size: 36px 100%;
        opacity: .28;
        animation: dtr-es-energy-stream var(--slider-cycle) linear infinite;
      }
      .dtr-es-sliderBloom::after {
        content: "";
        position: absolute;
        top: 1px;
        right: 0;
        left: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgb(220 254 247 / 64%) 42%, rgb(255 246 219 / 70%) 70%, transparent);
        opacity: .42;
        box-shadow: 0 0 3px rgb(var(--slider-tint) / 40%);
      }
      .dtr-es-sliderFillMax .dtr-es-sliderBloom {
        opacity: .85;
      }
      .dtr-es-sliderFillPeak .dtr-es-sliderBloom {
        animation: dtr-es-cosmic-flow calc(var(--slider-cycle) * 2) ease-in-out infinite alternate;
      }
      .dtr-es-sliderFillPeak .dtr-es-sliderBloom::before {
        opacity: .44;
      }
      .dtr-es-sliderCurrent {
        position: absolute;
        z-index: 2;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
      }
      .dtr-es-sliderCurrent::before, .dtr-es-sliderCurrent::after {
        content: "";
        position: absolute;
        top: 36%;
        left: 0;
        width: 40%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgb(var(--slider-tint) / 16%) 48%, rgb(239 255 250 / 76%) 94%, transparent);
        opacity: 0;
        transform: translateX(-120%);
        animation: dtr-es-energy-current var(--slider-cycle) linear infinite;
      }
      .dtr-es-sliderCurrent::after {
        top: 70%;
        width: 28%;
        background: linear-gradient(90deg, transparent, rgb(255 240 208 / 10%) 48%, rgb(255 246 223 / 62%) 94%, transparent);
        animation-delay: calc(var(--slider-cycle) * -.46);
      }
      .dtr-es-sliderStars {
        position: absolute;
        z-index: 1;
        inset: 0;
        overflow: hidden;
        border-radius: inherit;
        pointer-events: none;
      }
      .dtr-es-sliderStarsPeak::before {
        content: "";
        position: absolute;
        inset: -45% -65%;
        background: linear-gradient(110deg, transparent 32%, rgb(162 249 227 / 14%) 40%, rgb(255 255 255 / 16%) 43%, transparent 49%, rgb(255 232 190 / 12%) 64%, transparent 70%);
        animation: dtr-es-aurora calc(var(--slider-cycle) * 1.5) ease-in-out infinite alternate;
      }
      .dtr-es-sliderStarsPeak::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        box-shadow: inset 0 1px 0 rgb(255 255 255 / 20%), inset 0 0 5px rgb(222 250 240 / 12%);
      }
      .dtr-es-sliderStar {
        position: absolute;
        left: var(--star-x);
        top: var(--star-y);
        width: var(--star-size);
        height: var(--star-size);
        background: var(--star-color, #fff);
        clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
        opacity: var(--star-alpha);
        filter: drop-shadow(0 0 1px var(--star-color, #fff));
        transform: translate(-50%, -50%);
        animation: dtr-es-star-twinkle var(--star-duration) ease-in-out var(--star-delay) infinite;
      }
      .dtr-es-sliderStar:nth-child(3n) {
        animation-name: dtr-es-star-drift;
      }
      .dtr-es-sliderMeteor {
        --meteor-angle: 28deg;
        position: absolute;
        left: calc(var(--meteor-x) - var(--meteor-length));
        top: var(--meteor-y);
        width: var(--meteor-length);
        height: 1px;
        transform-origin: right center;
        background: linear-gradient(90deg, transparent, rgb(159 239 225 / 48%) 62%, #f3fff9);
        box-shadow: 0 0 3px rgb(225 255 244 / 36%);
        opacity: 0;
        animation: dtr-es-meteor var(--meteor-duration) linear var(--meteor-delay) infinite;
      }
      .dtr-es-sliderMeteor::before {
        content: "";
        position: absolute;
        inset: -2px 0;
        background: inherit;
        filter: blur(1px);
        opacity: .32;
      }
      .dtr-es-sliderMeteor::after {
        content: "";
        position: absolute;
        right: -2px;
        top: -1px;
        width: 3px;
        height: 3px;
        background: #f5fff9;
        box-shadow: 0 0 4px rgb(225 255 244 / 60%);
        clip-path: polygon(50% 0, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0 50%, 35% 35%);
      }
      .dtr-es-sliderBurst {
        position: absolute;
        left: 68%;
        top: 50%;
        width: 14px;
        height: 14px;
        background: #fff;
        clip-path: polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%);
        animation: dtr-es-star-burst 1.1s ease-out both;
      }
      @keyframes dtr-es-tech-grid {
        from { transform: translateX(0); }
        to { transform: translateX(24px); }
      }
      @keyframes dtr-es-track-scan {
        0%, 12% { transform: translateX(-120%); opacity: 0; }
        26% { opacity: calc(var(--slider-scan-opacity, .18) * .6); }
        54% { opacity: var(--slider-scan-opacity, .18); }
        78%, 100% { transform: translateX(340%); opacity: 0; }
      }
      @keyframes dtr-es-energy-stream {
        from { transform: translateX(-36px); }
        to { transform: translateX(0); }
      }
      @keyframes dtr-es-energy-current {
        0% { transform: translateX(-120%); opacity: 0; }
        16%, 52% { opacity: var(--current-opacity, .32); }
        82%, 100% { transform: translateX(460%); opacity: 0; }
      }
      @keyframes dtr-es-fill-core {
        0%, 100% { opacity: calc(var(--fill-core-opacity, .26) * .72); transform: scaleX(.88); }
        50% { opacity: var(--fill-core-opacity, .26); transform: scaleX(1.08); }
      }
      @keyframes dtr-es-tick-pulse {
        0%, 100% { transform: scale(.94); opacity: .76; }
        50% { transform: scale(1.06); opacity: 1; }
      }
      @keyframes dtr-es-star-twinkle {
        0%, 100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(.88) rotate(-6deg);
        }
        45% {
          opacity: var(--star-alpha);
          transform: translate(-50%, -50%) scale(1.08) rotate(12deg);
        }
        70% {
          opacity: calc(var(--star-alpha) * .74);
          transform: translate(-50%, -50%) scale(.96) rotate(4deg);
        }
      }
      @keyframes dtr-es-star-drift {
        0%, 100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(.9) rotate(-8deg);
        }
        50% {
          opacity: var(--star-alpha);
          transform: translate(calc(-50% + 1.5px), calc(-50% - 1px)) scale(1.08) rotate(14deg);
        }
      }
      /* 沿旋转后的局部横轴运动，使轨迹与尾迹对齐。 */
      @keyframes dtr-es-meteor {
        0% {
          opacity: 0;
          transform: rotate(var(--meteor-angle)) translateX(0);
        }
        8%, 42% {
          opacity: var(--meteor-alpha);
        }
        58%, 100% {
          opacity: 0;
          transform: rotate(var(--meteor-angle)) translateX(var(--meteor-distance));
        }
      }
      @keyframes dtr-es-cosmic-flow {
        from { background-position: 0 0, 0% 50%; }
        to { background-position: 0 0, 100% 50%; }
      }
      @keyframes dtr-es-aurora {
        from { transform: translateX(-18%) rotate(-5deg); }
        to { transform: translateX(18%) rotate(-5deg); }
      }
      @keyframes dtr-es-star-burst {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(.2) rotate(0);
        }
        25% {
          opacity: .72;
          transform: translate(-50%, -50%) scale(1.12) rotate(16deg);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(.5) rotate(45deg);
        }
      }
      .dtr-es-sliderKnob {
        position: absolute;
        z-index: 4;
        top: 50%;
        width: 30px;
        height: 30px;
        margin-left: -15px;
        pointer-events: none;
        transform: translateY(-50%);
        transition: left var(--slider-motion);
      }
      .dtr-es-sliderKnob::before {
        content: "";
        position: absolute;
        inset: -2px;
        border: 1px solid rgb(var(--slider-tint) / 42%);
        border-radius: 50%;
        box-shadow: 0 0 6px rgb(var(--slider-tint) / 22%);
        animation: dtr-es-knob-halo 5.6s ease-in-out infinite;
      }
      .dtr-es-sliderKnobFace {
        position: relative;
        z-index: 1;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 50%;
        border: 1px solid rgb(42 99 124 / 48%);
        background:
          linear-gradient(145deg, rgb(255 255 255 / 88%), rgb(255 255 255 / 34%) 32%, transparent 56%),
          linear-gradient(180deg, rgb(var(--slider-tint) / 78%), rgb(var(--slider-tint) / 40%) 58%, rgb(49 115 143 / 35%)),
          Canvas;
        box-shadow: 0 2px 4px rgb(0 0 0 / 18%), 0 0 5px rgb(var(--slider-tint) / 20%), inset 0 1px 1px rgb(255 255 255 / 85%), inset 0 -2px 3px rgb(0 0 0 / 14%);
        transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
      }
      .dtr-es-sliderKnobFace::before {
        content: "";
        position: absolute;
        top: -25%;
        bottom: -25%;
        left: 0;
        width: 10px;
        background: linear-gradient(90deg, transparent, rgb(255 255 255 / 48%), transparent);
        animation: dtr-es-knob-sheen 6.4s ease-in-out infinite;
      }
      .dtr-es-sliderKnobFace::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: 10px;
        border-radius: 2px;
        background: rgb(27 83 107 / 60%);
        box-shadow: 0 0 0 1px rgb(255 255 255 / 48%);
        transform: translate(-50%, -50%);
      }
      @keyframes dtr-es-knob-halo {
        0%, 100% { opacity: .36; }
        50% { opacity: .72; }
      }
      @keyframes dtr-es-knob-sheen {
        0%, 28% { transform: translateX(-18px) rotate(20deg); opacity: 0; }
        42% { opacity: .58; }
        62%, 100% { transform: translateX(42px) rotate(20deg); opacity: 0; }
      }
      .dtr-es-sliderRail:not([data-locked]):is(:hover, :focus-within) .dtr-es-sliderKnobFace {
        transform: scale(1.045);
        border-color: rgb(var(--slider-tint) / 90%);
        box-shadow: 0 3px 5px rgb(0 0 0 / 20%), 0 0 8px rgb(var(--slider-tint) / 28%), inset 0 1px 1px rgb(255 255 255 / 95%), inset 0 -2px 3px rgb(0 0 0 / 14%);
      }
      .dtr-es-sliderRail:not([data-locked]):active .dtr-es-sliderKnobFace {
        transform: scale(.97);
        border-color: rgb(var(--slider-tint) / 84%);
        box-shadow: 0 1px 2px rgb(0 0 0 / 14%), 0 0 5px rgb(var(--slider-tint) / 24%), inset 0 1px 1px rgb(255 255 255 / 90%), inset 0 -2px 3px rgb(0 0 0 / 16%);
      }
      .dtr-es-sliderRail:not([data-locked]):active .dtr-es-sliderFill,
      .dtr-es-sliderRail:not([data-locked]):active .dtr-es-sliderKnob {
        transition-duration: .08s;
      }
      .dtr-es-sliderTicks {
        position: absolute;
        z-index: 2;
        top: 0;
        right: 15px;
        bottom: 0;
        left: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        pointer-events: none;
      }
      .dtr-es-sliderTick {
        width: 4px;
        height: 4px;
        border: 1px solid rgb(200 230 226 / 26%);
        border-radius: 50%;
        background: rgb(0 0 0 / 15%);
        box-shadow: 0 0 0 1px rgb(0 0 0 / 8%);
      }
      .dtr-es-sliderTickActive {
        background: rgb(236 255 245 / 86%);
        border-color: rgb(255 250 227 / 66%);
        box-shadow: 0 0 3px rgb(var(--slider-tint) / 46%);
        animation: dtr-es-tick-pulse var(--slider-cycle) ease-in-out var(--tick-delay, 0s) infinite;
      }
      .dtr-es-slider {
        -webkit-appearance: none;
        appearance: none;
        position: absolute;
        z-index: 3;
        top: 50%;
        right: 0;
        bottom: auto;
        left: 0;
        width: 100%;
        height: 38px;
        transform: translateY(-50%);
        margin: 0;
        background: transparent;
        cursor: pointer;
        outline: none;
        touch-action: none;
        accent-color: transparent;
        color: transparent;
      }
      .dtr-es-slider:focus-visible {
        border-radius: 16px;
        outline: 1px solid rgb(var(--slider-tint) / 64%);
        outline-offset: 2px;
      }
      .dtr-es-slider:is(:disabled, [aria-disabled=true]) {
        cursor: wait;
        opacity: .6;
      }
      .dtr-es-slider::-webkit-slider-runnable-track {
        height: 26px;
        border: none;
        border-radius: 13px;
        background: transparent;
      }
      .dtr-es-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        box-sizing: border-box;
        width: 30px;
        height: 30px;
        margin-top: -2px;
        border-radius: 50%;
        background: transparent;
        border: none;
        box-shadow: none;
        cursor: inherit;
      }
      .dtr-es-slider::-moz-range-track, .dtr-es-slider::-moz-range-progress {
        height: 26px;
        border: none;
        border-radius: 13px;
        background: transparent;
      }
      .dtr-es-slider::-moz-range-thumb {
        box-sizing: border-box;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: transparent;
        border: none;
        box-shadow: none;
        cursor: inherit;
      }
      .dtr-es-sliderRail[data-locked] {
        opacity: .62;
      }
      .dtr-es-sliderRail[data-locked] *,
      .dtr-es-sliderRail[data-locked] *::before,
      .dtr-es-sliderRail[data-locked] *::after {
        animation-play-state: paused;
      }
      @media (prefers-reduced-motion: reduce) {
        .dtr-es-sliderRail,
        .dtr-es-sliderRail::before,
        .dtr-es-sliderRail *,
        .dtr-es-sliderRail *::before,
        .dtr-es-sliderRail *::after {
          animation: none !important;
          transition: none !important;
        }
        .dtr-es-sliderRail .dtr-es-sliderKnobFace {
          transform: none !important;
        }
        .dtr-es-sliderGroove::after,
        .dtr-es-sliderCurrent,
        .dtr-es-sliderBloom::before,
        .dtr-es-sliderMeteor,
        .dtr-es-sliderBurst {
          display: none;
        }
      }
      .dtr-model-group-title, .dtr-model-status {
        padding: 2px 6px;
        color: #666978;
        font-size: 11px;
        line-height: 16px;
        overflow-wrap: anywhere;
      }
      .dtr-model-group-title {
        padding-inline: var(--dtr-model-row-inset);
        font-weight: 600;
      }
      .dtr-model-group {
        display: grid;
        gap: 2px;
        overflow-wrap: anywhere;
      }
      .dtr-model-menu .dtr-dropdown-option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 28px;
        padding: 8px var(--dtr-model-row-inset);
        border-radius: 7px;
        font-size: 13px;
        line-height: 18px;
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

    const MAX_STARS = 24
    const MAX_METEORS = 6
    const randomBetween = (min, max) => min + Math.random() * (max - min)
    const randomStar = () => ({
      x: randomBetween(6, 94),
      y: randomBetween(16, 84),
      size: randomBetween(2.5, 5.5)
    })
    const randomMeteor = () => ({
      x: randomBetween(8, 76),
      y: randomBetween(-8, 8),
      distance: randomBetween(48, 88),
      length: randomBetween(18, 32)
    })

    function setStarPosition(element, star, scale) {
      element.style.setProperty("--star-x", `${star.x.toFixed(1)}%`)
      element.style.setProperty("--star-y", `${star.y.toFixed(1)}%`)
      element.style.setProperty("--star-size", `${(star.size * scale).toFixed(2)}px`)
    }

    function setMeteorPath(element, meteor) {
      element.style.setProperty("--meteor-x", `${meteor.x.toFixed(1)}%`)
      element.style.setProperty("--meteor-y", `${meteor.y.toFixed(1)}px`)
      element.style.setProperty("--meteor-distance", `${meteor.distance.toFixed(1)}px`)
      element.style.setProperty("--meteor-length", `${meteor.length.toFixed(1)}px`)
    }

    function EffortSlider({ label, levels, value, locked, onSelect }) {
      const [draft, setDraft] = useState(null)
      const pointer = useRef(null)
      const saving = useRef(false)
      const particlesRef = useRef(null)
      if (particlesRef.current === null) {
        particlesRef.current = {
          stars: Array.from({ length: MAX_STARS }, () => {
            const duration = randomBetween(2.6, 4.8)
            return { ...randomStar(), duration, delay: -randomBetween(0, duration) }
          }),
          meteors: Array.from({ length: MAX_METEORS }, () => ({
            ...randomMeteor(),
            period: randomBetween(1.8, 2.8),
            phase: Math.random()
          }))
        }
      }

      const currentIndex = Math.max(0, levels.findIndex(level => level.id === value))
      const displayedIndex = draft ?? currentIndex
      const displayedLevel = levels[displayedIndex]
      const maxIndex = levels.length - 1
      const effectIntensity = maxIndex > 0 ? displayedIndex / maxIndex : 0
      const atMax = displayedIndex === maxIndex
      const peakActive = atMax && effectIntensity > 0
      const starCount = peakActive ? MAX_STARS : effectIntensity > 0 ? Math.round(4 + effectIntensity * 10) : 0
      const meteorCount = peakActive ? MAX_METEORS : effectIntensity > 0 ? Math.max(1, Math.round(effectIntensity * 3)) : 0
      const starScale = atMax ? .95 : .74 + effectIntensity * .15
      const fillPct = maxIndex > 0 ? Math.round(effectIntensity * 100) : 100
      const offset = Math.round(15 - 30 * fillPct / 100)
      const fillWidth = `calc(${fillPct}% + (${offset}px))`
      const knobLeft = fillWidth

      async function commit(index) {
        if (locked || saving.current) return
        if (index === currentIndex || !levels[index]) {
          setDraft(null)
          return
        }
        saving.current = true
        setDraft(index)
        try {
          await onSelect(levels[index].id)
        } finally {
          saving.current = false
          setDraft(null)
        }
      }

      function beginDrag(event) {
        if (locked || saving.current || event.button !== 0 || pointer.current !== null) {
          event.preventDefault()
          return
        }
        pointer.current = event.pointerId
        event.currentTarget.setPointerCapture(event.pointerId)
      }

      function updateIndex(event) {
        if (locked || saving.current) return
        const index = event.currentTarget.valueAsNumber
        if (pointer.current !== null) setDraft(index)
        else void commit(index)
      }

      function endDrag(event) {
        if (pointer.current !== event.pointerId) return
        pointer.current = null
        void commit(event.currentTarget.valueAsNumber)
      }

      function cancelDrag(event) {
        if (pointer.current !== event.pointerId) return
        pointer.current = null
        setDraft(null)
      }

      return h(
        "div",
        { className: "dtr-es-sliderWrap" },
        h(
          "div",
          { className: "dtr-es-sliderHead" },
          h("span", null, label),
          h("strong", null, displayedLevel.name)
        ),
        h(
          "div",
          {
            className: "dtr-es-sliderRail",
            "data-locked": locked ? "true" : undefined,
            style: {
              "--slider-tint": peakActive ? "194 191 245" : "132 224 227",
              "--slider-rail-glow": (.28 + effectIntensity * .28 + (peakActive ? .08 : 0)).toFixed(2),
              "--slider-scan-opacity": (.08 + effectIntensity * .14 + (peakActive ? .03 : 0)).toFixed(2),
              "--current-opacity": (.16 + effectIntensity * .26 + (peakActive ? .06 : 0)).toFixed(2)
            }
          },
          h(
            "div",
            { className: "dtr-es-sliderGroove", "aria-hidden": true },
            h("div", { className: "dtr-es-sliderTrack" }),
            h("div", {
              className: atMax
                ? `dtr-es-sliderFill dtr-es-sliderFillMax${effectIntensity > 0 ? " dtr-es-sliderFillPeak" : ""}`
                : "dtr-es-sliderFill",
              style: {
                width: fillWidth,
                "--fill-core-opacity": (.14 + effectIntensity * .4 + (peakActive ? .1 : 0)).toFixed(2),
                "--fill-edge-opacity": (.24 + effectIntensity * .3).toFixed(2),
                "--fill-bloom-opacity": (.14 + effectIntensity * .28).toFixed(2)
              }
            },
              h("div", { className: "dtr-es-sliderBloom" }),
              h("div", { className: "dtr-es-sliderCurrent" }),
              starCount > 0
                ? h(
                  "div",
                  {
                    className: atMax ? "dtr-es-sliderStars dtr-es-sliderStarsPeak" : "dtr-es-sliderStars",
                    "aria-hidden": true
                  },
                  particlesRef.current.stars.slice(0, starCount).map((star, index) => h("span", {
                    key: index,
                    className: "dtr-es-sliderStar",
                    onAnimationIteration: (event) => {
                      const next = randomStar()
                      Object.assign(star, next)
                      setStarPosition(event.currentTarget, next, starScale)
                    },
                    style: {
                      "--star-x": `${star.x.toFixed(1)}%`,
                      "--star-y": `${star.y.toFixed(1)}%`,
                      "--star-size": `${(star.size * starScale).toFixed(2)}px`,
                      "--star-alpha": (.28 + effectIntensity * .32 + (atMax ? .08 : 0)).toFixed(2),
                      "--star-duration": `${(star.duration * (1.65 - effectIntensity * .2)).toFixed(2)}s`,
                      "--star-delay": `${star.delay.toFixed(2)}s`,
                      "--star-color": ["#effff9", "#dcf4ff", "#fff0d5"][index % 3]
                    }
                  })),
                  particlesRef.current.meteors.slice(0, meteorCount).map((meteor, index) => {
                    const duration = meteor.period * (atMax ? 1.35 : 2.2 - effectIntensity * .4)
                    return h("span", {
                      key: `meteor-${index}`,
                      className: "dtr-es-sliderMeteor",
                      onAnimationIteration: (event) => {
                        const next = randomMeteor()
                        Object.assign(meteor, next)
                        setMeteorPath(event.currentTarget, next)
                      },
                      style: {
                        "--meteor-x": `${meteor.x.toFixed(1)}%`,
                        "--meteor-y": `${meteor.y.toFixed(1)}px`,
                        "--meteor-distance": `${meteor.distance.toFixed(1)}px`,
                        "--meteor-length": `${meteor.length.toFixed(1)}px`,
                        "--meteor-alpha": atMax ? ".65" : (.22 + effectIntensity * .3).toFixed(2),
                        "--meteor-duration": `${duration.toFixed(2)}s`,
                        "--meteor-delay": `${(-meteor.phase * duration).toFixed(2)}s`
                      }
                    })
                  }),
                  atMax ? h("span", {
                    className: "dtr-es-sliderBurst",
                    onAnimationStart: (event) => {
                      event.currentTarget.style.left = `${randomBetween(18, 82).toFixed(1)}%`
                      event.currentTarget.style.top = `${randomBetween(35, 65).toFixed(1)}%`
                    }
                  }) : null
                )
                : null
            )
          ),
          h(
            "div",
            {
              className: "dtr-es-sliderKnob",
              "aria-hidden": true,
              style: { left: knobLeft }
            },
            h("div", { className: "dtr-es-sliderKnobFace" })
          ),
          h(
            "div",
            { className: "dtr-es-sliderTicks", "aria-hidden": true },
            levels.map((level, index) => h("span", {
              key: level.id ?? "provider-default",
              className: index <= displayedIndex ? "dtr-es-sliderTick dtr-es-sliderTickActive" : "dtr-es-sliderTick",
              style: { "--tick-delay": `${(-index * .16).toFixed(2)}s` }
            }))
          ),
          h('input', {
            className: 'dtr-es-slider',
            type: 'range',
            min: 0,
            max: maxIndex,
            step: 1,
            value: displayedIndex,
            disabled: maxIndex === 0,
            'aria-disabled': locked || undefined,
            'aria-label': label,
            'aria-valuetext': displayedLevel.name,
            onPointerDown: beginDrag,
            onPointerUp: endDrag,
            onPointerCancel: cancelDrag,
            onLostPointerCapture: cancelDrag,
            onChange: updateIndex,
            onKeyDown: event => {
              if (event.key === 'Enter' || (locked && event.key !== 'Escape' && event.key !== 'Tab')) event.preventDefault()
            },
          })
        )
      )
    }

    function TranslationModel({ form, modelUi, locked, pending, setPending, t }) {
      const snapshot = useConfig(form)
      const catalog = useCatalog(modelUi)
      const [saveFailed, setSaveFailed] = useState(false)
      const [open, setOpen] = useState(false)
      const root = useRef(null)
      const trigger = useRef(null)
      const menu = useRef(null)
      const triggerId = useId()
      const menuId = useId()
      const selected = snapshot.value?.selection
      const current = selected ?? catalog.value?.default
      const groups = (catalog.value?.groups ?? []).filter(group => group.models.length > 0)
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
      const currentName = model?.name ?? current?.model ?? t('followDefault')
      const currentLabel = [currentName, effortLabel].filter(Boolean).join(' · ')
      const disabled = locked || pending || !snapshot.writable

      useEffect(() => {
        if (!open) return undefined
        const closeOutside = event => {
          if (!root.current?.contains(event.target)) setOpen(false)
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
          if (!event.target.closest('.dtr-model-list')) event.preventDefault()
        }
        popup.addEventListener('wheel', handleWheel, { passive: false })
        return () => popup.removeEventListener('wheel', handleWheel)
      }, [open])
      useEffect(() => {
        if (locked || !snapshot.writable) setOpen(false)
      }, [locked, snapshot.writable])

      function closeMenu() {
        setOpen(false)
        trigger.current?.focus()
      }

      function toggleMenu() {
        if (disabled) return
        if (open) return closeMenu()
        setOpen(true)
      }

      function handleMenuKey(event) {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          closeMenu()
          return
        }
        const { key, target } = event
        if (target.type === 'range') return
        if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return
        const options = [...menu.current.querySelectorAll('button:not(:disabled)')]
        if (!options.length) return
        event.preventDefault()
        const index = options.indexOf(target)
        if (key === 'Home') options[0].focus()
        else if (key === 'End') options.at(-1).focus()
        else if (key === 'ArrowDown') options[(index + 1) % options.length].focus()
        else options[index < 0 ? options.length - 1 : (index - 1 + options.length) % options.length].focus()
      }

      async function choose(selection, keepOpen = false) {
        if (disabled) return
        if (open && !keepOpen) closeMenu()
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

      function option(label, key, checked, apply) {
        return h('button', { key, className: 'dtr-dropdown-option', type: 'button', 'aria-pressed': checked,
          onClick: checked ? closeMenu : apply }, label,
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
          catalog.status === 'ready' && groups.length === 0 && h('div', {
            className: 'dtr-model-status',
            role: 'status',
          }, t('noModels')),
          catalog.value?.failures?.map(failure => h('div', {
            key: failure.id,
            className: 'dtr-model-status',
            role: 'status',
          }, providerName(failure), ' · ', failure.message)),
          groups.map(group => {
            const name = providerName(group)
            return h('div', { key: group.id, className: 'dtr-model-group', role: 'group', 'aria-label': name },
              h('div', { className: 'dtr-model-group-title' }, name),
              group.models.map(model => {
                const checked = group.id === current?.provider && model.id === current?.model
                return option(model.name, model.id, checked, () => void choose({ provider: group.id, model: model.id }))
              }))
          }))
      }

      function saveEffort(reasoningEffort) {
        const selection = { provider: current.provider, model: current.model }
        if (reasoningEffort !== undefined) selection.reasoningEffort = reasoningEffort
        return choose(selection, true)
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
        renderModelList(),
        efforts.length > 0 && h('div', { className: 'dtr-effort-footer' },
          h(EffortSlider, {
            key: JSON.stringify([current.provider, current.model, efforts.map(level => level.id)]),
            label: t('thinkingEffort'),
            levels: efforts,
            value: effort,
            locked: disabled,
            onSelect: saveEffort,
          })))

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
          await streamTranslation(
            { target, text: source },
            controller.signal,
            text => { if (request.current === controller) setResult(text) },
            error => { if (request.current === controller) setError(error) },
          )
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

      function cancelTranslation() {
        const controller = request.current
        if (!controller) return
        request.current = null
        controller.abort()
        setPending(false)
      }

      function clearResult() {
        setResult('')
        setError(null)
      }

      function handleSourceKeyDown(event) {
        if (event.key !== 'Enter') return
        if (request.current) {
          event.preventDefault()
          return
        }
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
          pending
            ? h('button', { key: 'cancel', className: 'dtr-control dtr-primary', type: 'button',
              onClick: cancelTranslation }, t('cancelTranslation'))
            : h('button', { key: 'translate', className: 'dtr-control dtr-primary', type: 'submit',
              disabled: modelPending || !source.trim() }, t('translate')),
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
            dispose.push(ctx.remote.$on('settings/document-updated', namespace => {
              // 翻译设置由表单单独同步，改档位无需重新请求模型列表。
              if (namespace !== PLUGIN_ID) listener()
            }))
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
