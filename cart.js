/* global axios bootstrap Vue VeeValidateRules VeeValidate VeeValidateI18n  VueLoading */
const api = 'https://vue3-course-api.hexschool.io/v2'
const path = 'yu-hexschool'

// 全域載入套件規則(CDN)
Object.keys(VeeValidateRules).forEach(rule => {
  if (rule !== 'default') {
    VeeValidate.defineRule(rule, VeeValidateRules[rule])
  }
})
// 載入多國語系
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json')

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true // 調整為：輸入文字時，就立即進行驗證
})

const app = Vue.createApp({
  data () {
    return {
      // 購物車列表
      cartData: [],
      // 產品列表
      products: [],
      productId: '',
      isLoadingItem: '',
      form: {
        user: {
          tel: '',
          address: '',
          name: '',
          email: '',
          message: ''
        }
      },
      isLoading: false
    }
  },
  // components: {
  //   Loading
  // },
  mounted () {
    this.getProducts()
    this.getCart()
    this.addLoading()
  },
  methods: {
    getProducts () {
      axios.get(`${api}/api/${path}/products/all`)
        .then((res) => {
          this.products = res.data.products
        })
    },
    openProductModal (id) {
      this.productId = id
      // 取得dom元件並操作它的方法
      this.$refs.productModal.openModal()
    },
    getCart () {
      axios.get(`${api}/api/${path}/cart`)
        .then((res) => {
          this.cartData = res.data.data
        })
    },
    // 加入購物車的API需要帶入兩種參數
    addCart (id, qty = 1) {
      // 建構API需要的資料格式
      const data = { product_id: id, qty }
      this.isLoadingItem = id
      axios.post(`${api}/api/${path}/cart`, { data })
        .then((res) => {
          this.getCart()
          this.$refs.productModal.closeModal()
          this.isLoadingItem = ''
        })
    },
    removeCart (id) {
      axios.delete(`${api}/api/${path}/cart/${id}`)
        .then((res) => {
          this.productId = id
          this.getCart()
          this.isLoadingItem = id
        })
    },
    deleteCart () {
      axios.delete(`${api}/api/${path}/carts`)
        .then((res) => {
          this.getCart()
        })
    },
    updateCart (item) {
      // 建構API需要的資料格式
      const data = { product_id: item.id, qty: item.qty }
      this.isLoadingItem = item.id
      axios.put(`${api}/api/${path}/cart/${item.id}`, { data })
        .then((res) => {
          this.getCart()
          this.isLoadingItem = ''
        })
    },
    addLoading () {
      this.isLoading = true
      // simulate AJAX
      setTimeout(() => {
        this.isLoading = false
      }, 1000)
    },
    // 送出訂單
    onSubmit () {
      const data = this.form
      axios.post(`${api}/api/${path}/order`, { data })
        .then((res) => {
          // 使用套件提供的寫法清空表單但不跳錯誤訊息
          this.$refs.form.resetForm()
        })
    },
    isPhone (value) {
      const phoneNumber = /^(09)[0-9]{8}$/
      return phoneNumber.test(value) ? true : '需要正確的電話號碼'
    }
  }
})
// $refs
app.component('product-modal', {
  template: '#userProductModal',
  props: ['id'],
  data () {
    return {
      modal: {},
      product: {},
      qty: 1
    }
  },
  watch: {
    id () {
      this.getProduct()
    }
  },
  methods: {
    openModal () {
      this.modal.show()
    },
    closeModal () {
      this.modal.hide()
    },
    // 取得單一商品資料
    getProduct () {
      axios.get(`${api}/api/${path}/product/${this.id}`)
        .then((res) => {
          this.product = res.data.product
        })
    },
    addCart () {
      this.$emit('add-cart', this.product.id, this.qty)
    }
  },
  mounted () {
    this.modal = new bootstrap.Modal(this.$refs.modal)
  }
})
// 全域註冊元件
app.component('VForm', VeeValidate.Form)
app.component('VField', VeeValidate.Field)
app.component('ErrorMessage', VeeValidate.ErrorMessage)
// eslint-disable-next-line vue/multi-word-component-names
app.component('Loading', VueLoading.Component)
app.mount('#app')
