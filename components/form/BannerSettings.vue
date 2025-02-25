<script>
import Checkbox from '@/components/form/Checkbox';
import ColorInput from '@/components/form/ColorInput';
import LabeledInput from '@/components/form/LabeledInput';
import LabeledSelect from '@/components/form/LabeledSelect';
import RadioGroup from '@/components/form/RadioGroup';

export default ({
  props: {
    value: {
      type:    Object,
      default: () => {}
    },
    mode: {
      type:    String,
      default: 'edit',
    },
    bannerType: {
      type:     String,
      required: true
    }
  },

  components: {
    Checkbox, ColorInput, LabeledInput, LabeledSelect, RadioGroup
  },

  data() {
    const showAsDialog = !!this.value[this.bannerType]?.button || false;
    const buttonText = this.value[this.bannerType]?.button || this.t('branding.uiBanner.showAsDialog.defaultButtonText');

    return {
      showAsDialog,
      buttonText,
      uiBannerFontSizeOptions: ['10px', '12px', '14px', '16px', '18px', '20px'],
      themeVars:               {
        bannerBgColor:   getComputedStyle(document.body).getPropertyValue('--default'),
        bannerTextColor: getComputedStyle(document.body).getPropertyValue('--banner-text-color')
      }
    };
  },

  watch: {
    showAsDialog(neu, old) {
      if (neu !== old && !neu) {
        this.value[this.bannerType].button = '';
      } else {
        this.value[this.bannerType].button = this.buttonText;
      }
    },

    buttonText(neu, old) {
      if (neu !== old) {
        this.value[this.bannerType].button = neu;
      }
    }
  },

  computed: {
    radioOptions() {
      const options = ['left', 'center', 'right'];
      const labels = [
        this.t('branding.uiBanner.bannerAlignment.leftOption'),
        this.t('branding.uiBanner.bannerAlignment.centerOption'),
        this.t('branding.uiBanner.bannerAlignment.rightOption'),
      ];

      return { options, labels };
    },

    textDecorationOptions() {
      const options = [
        {
          style:  'fontWeight',
          label:  this.t('branding.uiBanner.bannerDecoration.bannerBold')
        },
        {
          style:  'fontStyle',
          label:  this.t('branding.uiBanner.bannerDecoration.bannerItalic')
        },
        {
          style:  'textDecoration',
          label:  this.t('branding.uiBanner.bannerDecoration.bannerUnderline')
        }
      ];

      return options;
    }
  }
});
</script>

<template>
  <div class="row mb-20">
    <div class="col span-12">
      <div class="row">
        <div class="col span-6">
          <LabeledInput v-model="value[bannerType].text" :label="t('branding.uiBanner.text')" />
          <div v-if="bannerType === 'bannerConsent'" class="mt-10">
            <Checkbox
              v-model="showAsDialog"
              name="bannerDecoration"
              class="banner-decoration-checkbox"
              :mode="mode"
              :label="t('branding.uiBanner.showAsDialog.label')"
              :tooltip="t('branding.uiBanner.showAsDialog.tooltip')"
            />
            <LabeledInput v-model="buttonText" :disabled="!showAsDialog" :label="t('branding.uiBanner.buttonText')" />
          </div>
        </div>
        <div class="col span-2">
          <RadioGroup
            v-model="value[bannerType].textAlignment"
            name="bannerAlignment"
            :label="t('branding.uiBanner.bannerAlignment.label')"
            :options="radioOptions.options"
            :labels="radioOptions.labels"
            :mode="mode"
          />
        </div>
        <div class="col span-2">
          <h3>
            {{ t('branding.uiBanner.bannerDecoration.label') }}
          </h3>
          <div v-for="o in textDecorationOptions" :key="o.style">
            <Checkbox
              v-model="value[bannerType][o.style]"
              name="bannerDecoration"
              class="banner-decoration-checkbox"
              :mode="mode"
              :label="o.label"
            />
          </div>
        </div>
        <div class="col span-2">
          <LabeledSelect
            v-model="value[bannerType].fontSize"
            :label="t('branding.uiBanner.bannerFontSize.label')"
            :options="uiBannerFontSizeOptions"
          />
        </div>
      </div>
      <div class="row mt-10">
        <div class="col span-6">
          <ColorInput v-model="value[bannerType].color" :default-value="themeVars.bannerTextColor" :label="t('branding.uiBanner.textColor')" />
        </div>
        <div class="col span-6">
          <ColorInput v-model="value[bannerType].background" :default-value="themeVars.bannerBgColor" :label="t('branding.uiBanner.background')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang='scss'>
.banner-decoration-checkbox {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  margin: 0;
  cursor: pointer;
  user-select: none;
  border-radius: var(--border-radius);
  padding-bottom: 5px;
  height: 24px;
}
</style>
