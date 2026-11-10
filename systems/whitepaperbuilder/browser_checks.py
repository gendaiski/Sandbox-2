"""Exercise the original UI without external network access; emits a real project and PDF."""
import asyncio,json,os,shutil,sys
from pathlib import Path
from playwright.async_api import async_playwright
HERE=Path(__file__).resolve().parent
OUT=HERE/'reports';OUT.mkdir(exist_ok=True)
APP=HERE/'upstream/index.html'
URL='https://whitepaperbuilder.test/'
async def main():
 checks=[];errors=[];unexpected=[]
 def ok(name,condition=True):
  if not condition:raise AssertionError(name)
  checks.append(name)
 async with async_playwright() as p:
  executable=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium')
  opts={'headless':True,'args':['--no-sandbox']}
  if executable:opts['executable_path']=executable
  browser=await p.chromium.launch(**opts)
  ctx=await browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True)
  async def route(r):
   if r.request.url==URL:await r.fulfill(status=200,content_type='text/html',body=APP.read_bytes())
   else:unexpected.append(r.request.url);await r.abort()
  await ctx.route('**/*',route)
  page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  async def idle():await page.wait_for_function('window.__wpbBusy === false && document.querySelectorAll("#pages .pagedjs_page").length>0',timeout=60000)
  async def tab(name):await page.locator('[data-tab="'+name+'"]').click()
  await page.goto(URL);await idle();ok('Original UI and paginated template',await page.title()=='White Paper Builder')
  for name in ['paper','summary','body','visuals','appendix','sources','back']:
   await tab(name);ok('Tab '+name,await page.locator('[data-pane="'+name+'"]').is_visible())
  await tab('paper');await page.locator('#m-title').fill('Responsible AI in Legal Engineering');await page.locator('#m-author').fill('Ahmed El Gendy');await page.locator('#m-subtitle').fill('A test paper for the complete White Paper Builder installation')
  await page.locator('#m-paper').select_option('white');await page.locator('#m-sectionBreaks').uncheck()
  svg=b'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200"><rect width="800" height="200" fill="#243e55"/><text x="40" y="110" fill="white" font-size="35">Legal engineering research</text></svg>'
  await page.locator('#coverFile').set_input_files({'name':'cover.svg','mimeType':'image/svg+xml','buffer':svg});await page.wait_for_function('document.querySelector("#coverInfo").textContent.length>0');ok('Cover image import')
  await tab('summary');await page.locator('#s-lead').fill('Evaluate traceable AI assistance in legal research.');await page.locator('#s-findings').fill('Source attribution improves review.\nHuman approval remains required.');await page.locator('#s-recs').fill('Document each source.\nReview generated citations.')
  await tab('sources');await page.locator('#srcAddTyped').click();await page.locator('#ty-key').fill('review-source');await page.locator('#ty-full').fill('Example Institute, *Research Methods* (2026).');await page.locator('#ty-short').fill('Example Institute, *Research Methods*.');await page.locator('#tySave').click();ok('Manual citation source added',await page.locator('#srcList .src').count()==1)
  source={'app':'OSINT Citation Generator','format':2,'sources':[{'id':'example-1','fields':{'type':'book','authors':'Jane Doe','title':'Evidence Methods','publisher':'Example Press','date':'2026'}}]}
  await page.locator('#srcPick').set_input_files({'name':'sources.json','mimeType':'application/json','buffer':json.dumps(source).encode()});await page.wait_for_function('document.querySelectorAll("#srcList .src").length===2');ok('OSINT source-list import')
  await tab('visuals');kinds=['bar','hbar','line','table','timeline','stats','image'];names=[]
  for i,kind in enumerate(kinds):
   await page.locator('#addVisual button').nth(i).click();card=page.locator('#visList .card').last;name='test-'+kind;names.append(name)
   await card.get_by_label('Name',exact=True).fill(name);await card.get_by_label('Name',exact=True).press('Tab')
   await card.locator('.field input').first.fill('Test '+kind+' visual')
   await card.get_by_label('Source',exact=True).fill('Synthetic installation test data')
   if kind=='image':await card.locator('input[type=file]').set_input_files({'name':'figure.svg','mimeType':'image/svg+xml','buffer':svg})
   else:
    data='Year,First,Second\n2024,10,20\n2025,30,15'
    if kind=='timeline':data='2024, Research began\n2025, Review completed'
    if kind=='stats':data='41%, Reviewed cases\n1200, Source documents'
    await card.get_by_label('Data',exact=True).fill(data)
   ok('Visual editor '+kind,await card.get_by_label('Kind',exact=True).input_value()==kind)
  await tab('body');body='# Research method\n\nEvidence with citation [@review-source, p. 3] and a note.^[A footnote retained in the printed pages.]\n\n## Scope\n\n**Bold claim** and *italic context*.\n\n>> Review note\n\nA paragraph with a margin note.\n\n!> Human review remains essential.\n\n> A block quotation.\n\n- One\n- Two\n\n1. First\n2. Second\n\n{R1} Verify every source.\n\n'+ '\n\n'.join('[['+n+']]' for n in names)+'\n\n---\n\n# Conclusion\n\nRepeated citation [@review-source].'
  await page.locator('#t-body').fill(body)
  await tab('appendix');await page.locator('#t-appendix').fill('# Supporting method\n\n## Notes\n\nAppendix content.\n\n[[rating-key]]')
  await tab('back');await page.locator('#b-include').check();await page.locator('#b-bio').fill('Ahmed El Gendy, Legal Engineer.');await page.locator('#b-history').fill('1.0 | 2026-11-10 | Installation verification');await page.locator('#b-license').fill('Test document for evaluation.')
  await idle();txt=await page.locator('#pages').inner_text();ok('Edited cover and back page rendered','Responsible AI in Legal Engineering' in txt and 'Legal Engineer' in txt);ok('Citations, footnotes and appendix rendered','Research Methods' in txt and 'Supporting method' in txt);ok('All seven visuals rendered',all('Test '+k+' visual' in txt for k in kinds));ok('Charts, images and tables rendered',await page.locator('#pages svg.chart').count()>=3 and await page.locator('#pages table').count()>=2 and await page.locator('#pages img').count()>=2)
  await page.locator('#themeDark').check();ok('Dark theme',await page.locator('html').get_attribute('data-theme')=='dark');await page.screenshot(path=str(OUT/'original-ui-dark.png'));await page.locator('#themeLight').check();ok('Light theme',await page.locator('html').get_attribute('data-theme')=='light')
  await tab('paper');await page.screenshot(path=str(OUT/'original-ui-light.png'))
  async with page.expect_download() as d:await page.locator('#saveBtn').click()
  download=await d.value;await download.save_as(OUT/'sample-project.json');saved=json.loads((OUT/'sample-project.json').read_text());ok('Save project JSON with embedded images',len((OUT/'sample-project.json').read_bytes())>2000)
  await page.reload();await idle();ok('Browser autosave survives reload',await page.locator('#m-title').input_value()=='Responsible AI in Legal Engineering')
  await page.locator('#newBtn').click();await page.locator('#newBtn').click();await idle();ok('New paper restores original template','[Paper title' in await page.locator('#m-title').input_value())
  await page.locator('#openPick').set_input_files(str(OUT/'sample-project.json'));await idle();ok('Open project round-trip',await page.locator('#m-title').input_value()=='Responsible AI in Legal Engineering')
  await page.evaluate('window.print=()=>{window.__testPrintCalled=true}')
  await page.locator('#printBtn').click();await page.wait_for_function('window.__testPrintCalled===true',timeout=60000);ok('Original print button invokes browser print')
  await idle();await page.pdf(path=str(OUT/'sample-whitepaper.pdf'),prefer_css_page_size=True,print_background=True);pdf=(OUT/'sample-whitepaper.pdf').read_bytes();ok('Real PDF generated',pdf.startswith(b'%PDF') and len(pdf)>20000)
  mobile=await ctx.new_page();await mobile.set_viewport_size({'width':390,'height':844});await mobile.goto(URL);await mobile.wait_for_function('window.__wpbBusy === false',timeout=60000);await mobile.locator('[data-tab="body"]').click();ok('Mobile editor tab responds',await mobile.locator('#t-body').is_visible());await mobile.close()
  ok('No external network resources',not unexpected);ok('No browser JavaScript errors',not errors)
  await browser.close()
 report={'status':'passed','checks':checks,'count':len(checks),'external_requests':unexpected,'page_errors':errors,'pdf_bytes':len(pdf)};(OUT/'browser-results.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
if __name__=='__main__':asyncio.run(main())
