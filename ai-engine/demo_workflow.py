"""
Complete workflow demonstration:
1. Check plagiarism
2. Rewrite flagged content
3. Detect AI in text
4. Humanize AI content
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def demo_workflow():
    print("\n" + "="*70)
    print("🎯 COMPLETE WORKFLOW DEMONSTRATION")
    print("="*70)
    
    # Step 1: Plagiarism Check
    print("\n📋 STEP 1: Checking for Plagiarism")
    print("-" * 70)
    
    test_text = """
    Machine learning is a method of data analysis that automates analytical 
    model building. It is a branch of artificial intelligence based on the 
    idea that systems can learn from data, identify patterns and make 
    decisions with minimal human intervention.
    """
    
    response = requests.post(f"{BASE_URL}/check-plagiarism", json={"text": test_text})
    result = response.json()
    
    print(f"   Plagiarism Score: {result['score']}%")
    print(f"   Flagged Sentences: {len(result.get('flaggedSentences', []))}")
    
    if result.get('flaggedSentences'):
        print("\n   🚨 Plagiarism detected! Rewriting...")
        
        # Step 2: Rewrite
        print("\n📝 STEP 2: Rewriting Plagiarized Content")
        print("-" * 70)
        
        rewrite_response = requests.post(f"{BASE_URL}/rewrite-text", 
                                        json={"text": test_text})
        rewrite_result = rewrite_response.json()
        
        rewritten = rewrite_result['rewrittenText']
        print(f"   Original: {test_text.strip()[:100]}...")
        print(f"   Rewritten: {rewritten[:100]}...")
        print(f"   ✅ Text successfully rewritten!")
        
        # Use rewritten text for AI detection
        test_text = rewritten
    
    # Step 3: AI Detection
    print("\n🤖 STEP 3: Detecting AI Content")
    print("-" * 70)
    
    ai_response = requests.post(f"{BASE_URL}/detect-ai-content", 
                               json={"text": test_text})
    ai_result = ai_response.json()
    
    print(f"   AI Score: {ai_result['score']}%")
    print(f"   Confidence: {ai_result.get('confidence', 'N/A')}%")
    
    analysis = ai_result.get('analysis', {})
    if analysis.get('reasons'):
        print(f"   Top Indicators:")
        for reason in analysis['reasons'][:3]:
            print(f"   - {reason}")
    
    if ai_result['score'] > 50:
        print("\n   🚨 High AI score detected! Humanizing...")
        
        # Step 4: Humanize
        print("\n👤 STEP 4: Humanizing AI Content")
        print("-" * 70)
        
        humanize_response = requests.post(f"{BASE_URL}/humanize-text", 
                                         json={"text": test_text})
        humanize_result = humanize_response.json()
        
        humanized = humanize_result['humanizedText']
        print(f"   Original: {test_text.strip()[:100]}...")
        print(f"   Humanized: {humanized[:100]}...")
        print(f"   ✅ Text successfully humanized!")
        
        # Final check
        print("\n🔍 STEP 5: Final AI Check on Humanized Text")
        print("-" * 70)
        
        final_response = requests.post(f"{BASE_URL}/detect-ai-content", 
                                      json={"text": humanized})
        final_result = final_response.json()
        
        print(f"   New AI Score: {final_result['score']}%")
        print(f"   Improvement: {ai_result['score'] - final_result['score']}% reduction")
    
    print("\n" + "="*70)
    print("✅ WORKFLOW COMPLETE!")
    print("="*70)
    print("\n📊 Summary:")
    print(f"   1. Plagiarism: {result['score']}%")
    print(f"   2. Initial AI Score: {ai_result['score']}%")
    if ai_result['score'] > 50:
        print(f"   3. Final AI Score: {final_result['score']}%")
        print(f"   4. Total Improvement: {ai_result['score'] - final_result['score']}%")
    print()

if __name__ == "__main__":
    try:
        demo_workflow()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to AI engine")
        print("   Make sure it's running: python main.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
