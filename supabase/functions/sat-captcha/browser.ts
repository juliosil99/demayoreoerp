
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { updateDownloadedFiles } from "./database.ts";

// Launch browser and handle SAT login and data retrieval
export async function processSatPortal(
  rfc: string, 
  password: string, 
  captchaSolution: string, 
  job: any,
  token: string
) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Login to SAT portal
    await loginToSatPortal(page, rfc, password, captchaSolution);
    
    // Navigate to invoice search
    await navigateToInvoiceSearch(page);
    
    // Set date range and search
    await searchInvoices(page, job.start_date, job.end_date);
    
    // Check for results
    const hasResults = await checkForResults(page);
    if (!hasResults) {
      await browser.close();
      return { 
        success: true, 
        message: "No invoices found for the specified date range",
        noResults: true
      };
    }
    
    // Get total number of results
    const totalResults = await getTotalResults(page);
    
    // Download each invoice
    await downloadInvoices(page, totalResults, job.id, token);
    
    // Close browser
    await browser.close();
    
    return {
      success: true,
      message: `Successfully downloaded ${totalResults} invoices`,
      totalResults
    };
  } catch (error) {
    // Take screenshot of error state
    const screenshot = await page.screenshot();
    await browser.close();
    
    throw {
      message: error.message || "Error during SAT process",
      screenshot
    };
  }
}

async function loginToSatPortal(page: any, rfc: string, password: string, captchaSolution: string) {
  // Navigate to SAT login page
  await page.goto('https://portalcfdi.facturaelectronica.sat.gob.mx');
  
  // Fill RFC and password fields
  await page.type('#rfc', rfc);
  await page.type('#password', password);
  
  // Fill CAPTCHA solution if needed
  const captchaInput = await page.$('#captcha');
  if (captchaInput) {
    await captchaInput.type(captchaSolution);
  } else {
    throw new Error("CAPTCHA field not found");
  }
  
  // Submit the login form
  await page.click('#submit');
  
  // Wait for login to complete and check if we're on the dashboard
  try {
    await page.waitForSelector('#selFiltro', { timeout: 10000 });
  } catch (e) {
    // Check for error messages
    const errorText = await page.evaluate(() => {
      const errorEl = document.querySelector('.errorcl');
      return errorEl ? errorEl.textContent : '';
    });
    throw new Error(`Login failed: ${errorText.trim() || 'Invalid CAPTCHA solution or credentials'}`);
  }
}

async function navigateToInvoiceSearch(page: any) {
  // Navigate to "Consultar Facturas Recibidas"
  await page.click('a:has-text("Consultar Facturas Recibidas")');
}

async function searchInvoices(page: any, startDate: string, endDate: string) {
  // Set date range for invoice search
  await page.type('input[name="fechaInicial"]', startDate);
  await page.type('input[name="fechaFinal"]', endDate);
  
  // Submit search form
  await page.click('#btnBusqueda');
  
  // Wait for search results
  await page.waitForSelector('table.detalleTable', { timeout: 30000 });
}

async function checkForResults(page: any) {
  // Check if there are any results
  const noResults = await page.evaluate(() => {
    return document.querySelectorAll('.noResultados').length > 0;
  });
  
  return !noResults;
}

async function getTotalResults(page: any) {
  // Get total number of results
  return await page.evaluate(() => {
    return document.querySelectorAll('table.detalleTable tbody tr').length;
  });
}

async function downloadInvoices(page: any, totalResults: number, jobId: string, token: string) {
  // Process each invoice XML
  for (let i = 0; i < totalResults; i++) {
    try {
      // Click download button for each invoice
      await page.click(`table.detalleTable tbody tr:nth-child(${i + 1}) td:last-child a[id^="BtnDescarga"]`);
      await page.waitForTimeout(2000);
      
      // Update download counter
      await updateDownloadedFiles(jobId, i + 1, token);
    } catch (downloadError) {
      console.error(`Error downloading invoice ${i + 1}:`, downloadError);
    }
  }
}
