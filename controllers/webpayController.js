const webpayService = require('../services/webpayService');

class WebpayController {
  async crearTransaccion(req, res) {
    try {
        const { buyOrder, clienteId, items } = req.body;
        
        if (!buyOrder || !clienteId || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
            error: 'Datos incompletos. Se requiere buyOrder, clienteId e items' 
        });
        }
        
        // Ya no necesitamos validar amount porque lo calcularemos
        const response = await webpayService.crearTransaccion(buyOrder, clienteId, items);
        
        // Si la solicitud es AJAX, devolver JSON
        if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.json(response);
        }
        
        // Si no, enviar una página HTML con un formulario de redirección automática
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Redirigiendo a WebPay</title>
            <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            .loader { border: 16px solid #f3f3f3; border-top: 16px solid #3498db; border-radius: 50%; width: 120px; height: 120px; animation: spin 2s linear infinite; margin: 0 auto; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <h1>Redirigiendo a WebPay</h1>
            <p>Por favor espere, será redirigido a la pasarela de pago...</p>
            <p>Monto total: $${response.amount}</p>
            <div class="loader"></div>
            
            <form id="webpayForm" action="${response.url}" method="POST">
            <input type="hidden" name="token_ws" value="${response.token}">
            </form>
            
            <script>
            // Enviar el formulario automáticamente
            document.addEventListener('DOMContentLoaded', function() {
                document.getElementById('webpayForm').submit();
            });
            </script>
        </body>
        </html>
        `);
    } catch (error) {
        console.error('Error en controlador crearTransaccion:', error);
        res.status(500).json({ error: error.message });
    }
    }
    
  async confirmarTransaccion(req, res) {
    try {
        // Logging para debug
        console.log('Confirmación recibida. Query params:', req.query);
        
        const { token_ws } = req.query;
        
        if (!token_ws) {
        return res.status(400).send(`
            <html>
            <head><title>Error</title></head>
            <body>
                <h1>Error</h1>
                <p>Token no proporcionado</p>
            </body>
            </html>
        `);
        }
        
        // Agregar más logging
        console.log('Procesando token:', token_ws);
        
        // Confirmar transacción
        try {
        const result = await webpayService.confirmarTransaccion(token_ws);
        
        // Verificar si el resultado es válido
        if (!result) {
            throw new Error('La respuesta de WebPay es vacía o inválida');
        }
        
        console.log('Respuesta de WebPay:', result);
        
        // Respuesta para el navegador/cliente
        if (req.headers.accept?.includes('application/json')) {
            return res.json({
            success: result.response_code === 0,
            transaccion: result
            });
        }
        
        // Respuesta HTML
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
            <title>Confirmación de Pago</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .success { color: green; }
                .error { color: red; }
                .details { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            </style>
            </head>
            <body>
            <h1 class="${result.response_code === 0 ? 'success' : 'error'}">
                ${result.response_code === 0 ? 'Pago Exitoso' : 'Pago Rechazado'}
            </h1>
            <div class="details">
                <p><strong>Orden:</strong> ${result.buy_order}</p>
                <p><strong>Monto:</strong> $${result.amount}</p>
                <p><strong>Tarjeta:</strong> ${result.card_detail?.card_number || 'N/A'}</p>
                <p><strong>Estado:</strong> ${result.status}</p>
            </div>
            <p><a href="/">Volver al inicio</a></p>
            </body>
            </html>
        `);
        } catch (commitError) {
        console.error('Error al confirmar transacción con WebPay:', commitError);
        throw new Error(`Error al confirmar con WebPay: ${commitError.message}`);
        }
    } catch (error) {
        console.error('Error general en confirmarTransaccion:', error);
        
        return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error en el Pago</title>
            <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .error { color: red; }
            pre { background: #f5f5f5; padding: 15px; overflow-x: auto; }
            </style>
        </head>
        <body>
            <h1 class="error">Error en el Procesamiento del Pago</h1>
            <p>${error.message}</p>
            <h3>Detalles técnicos:</h3>
            <pre>${error.stack}</pre>
            <p><a href="/">Volver al inicio</a></p>
        </body>
        </html>
        `);
    }
    }
}

module.exports = new WebpayController();