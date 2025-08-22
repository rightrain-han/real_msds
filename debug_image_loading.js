// 이미지 로딩 디버깅 스크립트
// 브라우저 콘솔에서 실행하여 이미지 로딩 문제를 진단합니다.

function debugImageLoading() {
    console.log('=== 이미지 로딩 디버깅 시작 ===');
    
    // 모든 이미지 요소 찾기
    const images = document.querySelectorAll('img[src*="/api/msds/"]');
    console.log(`발견된 MSDS 이미지 개수: ${images.length}`);
    
    images.forEach((img, index) => {
        const src = img.src;
        const alt = img.alt;
        
        console.log(`\n이미지 ${index + 1}:`);
        console.log(`  - src: ${src}`);
        console.log(`  - alt: ${alt}`);
        console.log(`  - display: ${img.style.display}`);
        console.log(`  - visible: ${img.offsetWidth > 0 && img.offsetHeight > 0}`);
        
        // 이미지 로딩 상태 확인
        if (img.complete) {
            if (img.naturalWidth === 0) {
                console.log(`  - 상태: 로딩 실패 (naturalWidth: ${img.naturalWidth})`);
            } else {
                console.log(`  - 상태: 로딩 성공 (naturalWidth: ${img.naturalWidth})`);
            }
        } else {
            console.log(`  - 상태: 로딩 중...`);
        }
    });
    
    // 경고표지와 보호장구 텍스트 요소들 확인
    const warningTexts = document.querySelectorAll('.warning-text');
    const equipmentTexts = document.querySelectorAll('.equipment-text');
    
    console.log(`\n경고표지 텍스트 개수: ${warningTexts.length}`);
    console.log(`보호장구 텍스트 개수: ${equipmentTexts.length}`);
    
    warningTexts.forEach((text, index) => {
        console.log(`경고표지 텍스트 ${index + 1}: "${text.textContent}" (display: ${text.style.display})`);
    });
    
    equipmentTexts.forEach((text, index) => {
        console.log(`보호장구 텍스트 ${index + 1}: "${text.textContent}" (display: ${text.style.display})`);
    });
}

// 이미지 로딩 이벤트 리스너 추가
function addImageLoadListeners() {
    const images = document.querySelectorAll('img[src*="/api/msds/"]');
    
    images.forEach((img, index) => {
        img.addEventListener('load', () => {
            console.log(`✅ 이미지 로딩 성공: ${img.src}`);
        });
        
        img.addEventListener('error', (e) => {
            console.error(`❌ 이미지 로딩 실패: ${img.src}`);
            console.error(`   에러:`, e);
        });
    });
}

// 실행
debugImageLoading();
addImageLoadListeners();

console.log('\n=== 디버깅 스크립트 로드 완료 ===');
console.log('이미지 로딩 상태를 확인하려면 debugImageLoading() 함수를 다시 실행하세요.');

