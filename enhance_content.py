import os, glob

extra_content = """
            <div class="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h2 class="text-xl font-bold text-gray-800 mb-4">핵심 요약 및 FAQ</h2>
                <div class="space-y-4">
                    <div>
                        <p class="font-bold text-gray-800">Q. 이 팁을 실전에 바로 적용할 수 있나요?</p>
                        <p class="text-gray-600 text-sm">네, 위 가이드는 초보자부터 중급자까지 실전에서 바로 활용할 수 있는 핵심만을 담았습니다. 특히 자신의 골프 MBTI 유형을 알고 있다면 더 큰 시너지 효과를 얻을 수 있습니다.</p>
                    </div>
                    <div>
                        <p class="font-bold text-gray-800">Q. 더 자세한 조언이 필요하다면?</p>
                        <p class="text-gray-600 text-sm">골프 MBTI 테스트 결과 페이지에서 제공되는 '유형별 맞춤 연습법'을 참고해 보세요. 장비 선택부터 멘탈 관리까지 본인에게 최적화된 가이드를 제공합니다.</p>
                    </div>
                </div>
            </div>
"""

article_files = glob.glob('golf-*.html')
article_files.append('articles.html')

for filepath in article_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '핵심 요약 및 FAQ' not in content:
        if '<!-- CTA -->' in content:
            content = content.replace('<!-- CTA -->', extra_content + '\n        <!-- CTA -->')
        elif '<!-- Related -->' in content:
            content = content.replace('<!-- Related -->', extra_content + '\n        <!-- Related -->')
        else:
            content = content.replace('</main>', extra_content + '\n    </main>')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Enhanced {filepath}')
