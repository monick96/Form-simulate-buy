Vue.createApp({
    data() {
        return{
            paymentData: {
                description: '',
                number: '',
                cvv: null,
                amount: null
            },
            errorMessage: null,
            paymentApproved: false,
        }
    },
    methods: {
        makePayment() {
            // Elimina cualquier guión antes de la validación
            this.paymentData.number = this.paymentData.number.replace(/-/g, '');

            // Verifica la validez del número de tarjeta de crédito
            if (!this.isValidCreditCardNumber(this.paymentData.number)) {

                this.errorMessage = 'Número de tarjeta de crédito no válido.';
                return;

            }

            // Si no contiene guiones, agrégarle automáticamente
            if (!this.paymentData.number.includes('-')) {

                this.paymentData.number = this.addHyphens(this.paymentData.number);

            }

            if (!this.isValidCVV(this.paymentData.cvv)) {

                // Si el CVV no es válido, muestra un mensaje de error
                this.errorMessage = 'CVV no válido.';
                return;

            }

            // Verifica que el monto sea mayor a cero
            if (this.paymentData.amount <= 0) {

                this.errorMessage = 'El monto debe ser mayor a cero.';
                return;

            }

            // Abre el cuadro de diálogo modal
            this.showModal.show();
            console.log('Making payment...');
            console.log('Payment data:', this.paymentData);

        },
        confirmPayment() {

            console.log("confirming with the server");

            // Realiza una solicitud POST con Axios
            axios.post('http://localhost:8080/api/transactions/pay', this.paymentData)
                .then(response => {

                    // Maneja la respuesta exitosa 
                    console.log('Payment successful');
                    this.errorMessage = null;
                    this.paymentApproved = true;
                    this.showModal.hide();
                    
                    // Espera 1.5 segundos (3000 milisegundos) antes de recargar la página
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500); // 1000 ms = 1 segundos

                })
                .catch(error => {

                    // Maneja los errores 
                    console.error('Payment error',error);
                    this.errorToats.show();

                    // Verifica si error.response existe antes de acceder a error.response.data
                    if (error.response) {

                        console.error('Error response data', error.response.data);
                        this.errorMessage = 'Error: ' + error.response.data;
                        this.errorToats.show();

                    } else {

                        console.error('No response from server');
                        this.errorMessage = 'No response from server.';
                        this.errorToats.show();

                    }

                    // Cierra el cuadro de diálogo modal después de la confirmación
                    this.showModal.hide();

                });
        },
        addHyphens(cardNumber) {

            // Supongamos que el número de tarjeta de crédito es "1234567890123456"
            // Insertamos guiones cada 4 dígitos para que sea "1234-5678-9012-3456"
            const formattedCardNumber = cardNumber.replace(/(\d{4})/g, '$1-');

            // Elimina el guión final si lo hubiera
            return formattedCardNumber.replace(/-$/, '');

        },
            
        // Función para validar el CVV usando una expresión regular
        isValidCVV(cvv) {

            const cvvPattern = /^\d{3}$/; // Verifica que haya exactamente 3 dígitos

            return cvvPattern.test(cvv);

        },
        // Función para validar el número de tarjeta de crédito usando una expresión regular
        isValidCreditCardNumber(cardNumber) {

            const cardNumberPattern = /^\d{16}$/; // Verifica que haya exactamente 16 dígitos

            return cardNumberPattern.test(cardNumber);

        }
    },
    mounted: function () {

        this.errorToats = new bootstrap.Toast(document.getElementById('danger-toast'));

        this.showModal = new bootstrap.Modal(document.getElementById('confirmationModal'));

    }
}).mount('#app')