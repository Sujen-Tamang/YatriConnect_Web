import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';

export const generateETicket = async (booking, user, bus) => {
    // 1. Generate QR Code Data URL
    const qrData = `BookingID: ${booking.bookingId} | User: ${user.name}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    // 2. Fill HTML template with data
    const html = `
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; padding: 30px; }
            .ticket { border: 2px dashed #4CAF50; padding: 20px; max-width: 600px; margin: auto; }
            .header { color: #4CAF50; text-align: center; }
            .details { margin: 15px 0; }
            .seat { background: #f8f9fa; padding: 5px 10px; margin-right: 5px; display: inline-block; }
            .qr { text-align: center; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="ticket">
            <h1 class="header">Yatru Sewa E-Ticket</h1>
            <div class="details">
                <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                <p><strong>Passenger:</strong> ${user.name}</p>
                <p><strong>Route:</strong> ${bus.route.from} → ${bus.route.to}</p>
                <p><strong>Departure:</strong> ${bus.schedule.departure} | ${new Date(booking.travelDate).toDateString()}</p>
                <p><strong>Bus:</strong> ${bus.busNumber} (${bus.seats.length} seater)</p>
                <p><strong>Seats:</strong> ${booking.seats.map(s => `<span class="seat">${s}</span>`).join('')}</p>
                <p><strong>Amount Paid:</strong> NPR ${booking.totalPrice}</p>
            </div>
            <div class="qr">
                <img src="${qrCodeDataUrl}" width="120" height="120" />
                <p>Scan this QR code when boarding</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // 3. Use Puppeteer to render HTML and export PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return pdfBuffer;
};
