import json,re,time,os
from pathlib import Path
from playwright.sync_api import sync_playwright
from reportlab.pdfgen.canvas import Canvas
out=Path(__file__).resolve().parents[1]/'evidence'
out.mkdir(exist_ok=True)
base=os.environ.get('LEGALRAG_TEST_URL','http://127.0.0.1:7860').rstrip('/')
pdf=out/'english-upload-test.pdf'
c=Canvas(str(pdf)); c.drawString(50,790,'English Installation Verification');c.drawString(50,760,'The Silver Heron review protocol requires a compliance review every seventeen days.');c.drawString(50,730,'A designated reviewer records each decision and confirms completion in writing.');c.save()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 ctx=browser.new_context(locale='zh-CN',viewport={'width':1440,'height':1000})
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(base+'/',wait_until='networkidle')
 page.wait_for_function('document.querySelector("#sendBtn") && !document.querySelector("#sendBtn").disabled',timeout=120000)
 page.locator('#question').fill('What is the implied warranty of merchantability under UCC 2-314?')
 page.locator('#sendBtn').click()
 page.wait_for_function('document.querySelector("#evidenceList").innerText.includes("2-314")',timeout=120000)
 page.wait_for_function('!document.querySelector("#sendBtn").disabled',timeout=30000)
 text=page.locator('body').inner_text();assert not re.search('[\u4e00-\u9fff]',text),text
 assert 'key' in page.locator('#chatList').inner_text().lower()
 page.screenshot(path=str(out/'desktop-english.png'),full_page=True)
 page.locator('#openaiKey').fill('sk-browser-test-not-a-real-key');page.locator('#saveKeyBtn').click();page.locator('#clearKeyBtn').click();assert page.locator('#openaiKey').input_value()==''
 page.locator('#newChatBtn').click();assert page.locator('#question').input_value()==''
 page.locator('#pdfFile').set_input_files(str(pdf));page.locator('#uploadBtn').click()
 page.wait_for_timeout(1500)
 page.screenshot(path=str(out/'upload-start.png'),full_page=True)
 ctx2=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 mob=ctx2.new_page();mob.goto(base+'/',wait_until='networkidle');mob.screenshot(path=str(out/'mobile-english.png'),full_page=True)
 result={'javascript_errors':errors,'english_even_with_chinese_locale':True,'retrieval_citation':'UCC 2-314','key_save_clear':True,'new_chat':True,'mobile_horizontal_overflow':mob.evaluate('document.documentElement.scrollWidth>innerWidth'),'upload_initial_status':page.locator('#uploadStatus').inner_text()}
 (out/'browser-checks.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
 assert not errors, errors
 assert not result['mobile_horizontal_overflow']
 browser.close()
