import { useState } from "react";
import { ArrowLeft, Send, Sparkles, ChefHat } from "lucide-react";
import { useNavigate } from "react-router";

type ChatStep = 'purpose' | 'style' | 'ingredients' | 'cooking' | 'time' | 'result';

interface ChatMessage {
  type: 'bot' | 'user';
  content: string;
}

interface UserChoices {
  purpose?: string;
  style?: string;
  ingredients?: string;
  cooking?: string;
  time?: string;
}

interface SavedRecipe {
  id: string;
  name: string;
  difficulty: string;
  time: string;
  servings: string;
  ingredients: string[];
  steps: string[];
  additionalInfo?: string;
  userChoices: UserChoices;
  savedAt: string;
}

export default function AIChat() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ChatStep>('purpose');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: 'bot', content: '안녕하세요! 🍳 오늘 어떤 음식을 만들고 싶으신가요?' },
    { type: 'bot', content: '먼저 목적을 선택해주세요!' }
  ]);
  const [userChoices, setUserChoices] = useState<UserChoices>({});
  const [inputValue, setInputValue] = useState('');
  const [currentRecipe, setCurrentRecipe] = useState<SavedRecipe | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // 스타일별 추천 식재료
  const recommendedIngredients: Record<string, string[]> = {
    '한식': ['밥', '김치', '계란', '대파', '간장', '참기름', '고추장', '된장', '두부', '당근'],
    '양식': ['파스타면', '토마토소스', '치즈', '올리브유', '마늘', '양파', '버터', '크림', '베이컨'],
    '중식': ['밥', '계란', '대파', '간장', '굴소스', '청경채', '두부', '당근', '양파', '식용유'],
    '일식': ['밥', '계란', '간장', '김', '미림', '두부', '대파', '참치캔', '깨', '와사비'],
    '분식': ['라면', '떡', '계란', '대파', '김치', '어묵', '고추장', '치즈', '햄', '양파'],
    '기타': ['밥', '계란', '대파', '간장', '식용유', '마늘', '양파', '소금', '후추']
  };

  const questions = {
    purpose: {
      question: '어떤 목적의 요리인가요?',
      options: ['야식', '아침', '점심', '저녁', '간식', '후식']
    },
    style: {
      question: '어떤 스타일의 음식을 원하시나요?',
      options: ['한식', '양식', '중식', '일식', '분식', '기타']
    },
    ingredients: {
      question: '현재 가지고 있는 식재료를 입력해주세요',
      freeInput: true
    },
    cooking: {
      question: '원하는 조리 방식은?',
      options: ['볶음', '끓임', '구이', '찜', '무침', '튀김', '상관없음']
    },
    time: {
      question: '조리 시간은 얼마나 되나요?',
      options: ['10분 이내', '10-20분', '20-30분', '30분 이상', '상관없음']
    }
  };

  const handleChoice = (choice: string) => {
    const newMessages = [...messages, { type: 'user' as const, content: choice }];
    setMessages(newMessages);

    const nextStep = getNextStep(step);
    const updatedChoices = { ...userChoices, [step]: choice };
    setUserChoices(updatedChoices);

    setTimeout(() => {
      if (nextStep === 'result') {
        generateRecipe(updatedChoices);
      } else if (nextStep === 'ingredients') {
        // 식재료 단계에서는 추천 식재료도 함께 표시
        const question = questions[nextStep as keyof typeof questions];
        const styleIngredients = recommendedIngredients[choice] || recommendedIngredients['기타'];
        setMessages([
          ...newMessages, 
          { type: 'bot', content: question.question },
          { type: 'bot', content: `💡 ${choice} 스타일에 자주 쓰이는 식재료예요. 가지고 있는 재료를 선택해보세요!` }
        ]);
        setStep(nextStep);
      } else {
        const question = questions[nextStep as keyof typeof questions];
        setMessages([...newMessages, { type: 'bot', content: question.question }]);
        setStep(nextStep);
      }
    }, 500);
  };

  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients(prev => {
      if (prev.includes(ingredient)) {
        return prev.filter(item => item !== ingredient);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const handleIngredientsSubmit = () => {
    const allIngredients = [...selectedIngredients, ...inputValue.split(/[,，\s]+/).map(i => i.trim()).filter(i => i.length > 0)];
    const ingredientsText = [...new Set(allIngredients)].join(', ');
    
    if (!ingredientsText.trim()) return;

    const newMessages = [...messages, { type: 'user' as const, content: ingredientsText }];
    setMessages(newMessages);

    const nextStep = getNextStep(step);
    const updatedChoices = { ...userChoices, ingredients: ingredientsText };
    setUserChoices(updatedChoices);
    setInputValue('');
    setSelectedIngredients([]);

    setTimeout(() => {
      if (nextStep === 'result') {
        generateRecipe(updatedChoices);
      } else {
        const question = questions[nextStep as keyof typeof questions];
        setMessages([...newMessages, { type: 'bot', content: question.question }]);
        setStep(nextStep);
      }
    }, 500);
  };

  const handleFreeInput = () => {
    if (step === 'ingredients') {
      handleIngredientsSubmit();
    } else {
      if (!inputValue.trim()) return;

      const newMessages = [...messages, { type: 'user' as const, content: inputValue }];
      setMessages(newMessages);

      const nextStep = getNextStep(step);
      const updatedChoices = { ...userChoices, [step]: inputValue };
      setUserChoices(updatedChoices);
      setInputValue('');

      setTimeout(() => {
        if (nextStep === 'result') {
          generateRecipe(updatedChoices);
        } else {
          const question = questions[nextStep as keyof typeof questions];
          setMessages([...newMessages, { type: 'bot', content: question.question }]);
          setStep(nextStep);
        }
      }, 500);
    }
  };

  const getNextStep = (currentStep: ChatStep): ChatStep => {
    const steps: ChatStep[] = ['purpose', 'style', 'ingredients', 'cooking', 'time', 'result'];
    const currentIndex = steps.indexOf(currentStep);
    return steps[currentIndex + 1];
  };

  const generateRecipe = (choices: UserChoices) => {
    setMessages(prev => [...prev, 
      { type: 'bot', content: '잠시만 기다려주세요... AI가 최적의 레시피를 찾고 있습니다 🔍' }
    ]);

    setTimeout(() => {
      // 재료 파싱
      const userIngredients = parseIngredients(choices.ingredients || '');
      const recipe = findRecipeByIngredients(userIngredients, choices);

      setMessages(prev => [
        ...prev.slice(0, -1),
        { 
          type: 'bot', 
          content: `완벽한 레시피를 찾았습니다! 🎉\n\n📌 ${recipe.name}\n난이도: ${recipe.difficulty}\n조리시간: ${recipe.time}\n분량: ${recipe.servings}` 
        },
        {
          type: 'bot',
          content: `🥘 필요한 재료:\n${recipe.ingredients.join('\n')}`
        },
        {
          type: 'bot',
          content: `👨‍🍳 조리 방법:\n${recipe.steps.join('\n\n')}`
        },
        {
          type: 'bot',
          content: recipe.additionalInfo ? `💡 추가 정보:\n${recipe.additionalInfo}` : '이 레시피를 저장하시겠습니까? 📝'
        }
      ]);
      setStep('result');
      setCurrentRecipe({
        id: Date.now().toString(),
        name: recipe.name,
        difficulty: recipe.difficulty,
        time: recipe.time,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        additionalInfo: recipe.additionalInfo,
        userChoices: choices,
        savedAt: new Date().toISOString()
      });
    }, 2000);
  };

  // 재료 파싱 함수
  const parseIngredients = (ingredientString: string): string[] => {
    return ingredientString
      .split(/[,，\s]+/)
      .map(i => i.trim().toLowerCase())
      .filter(i => i.length > 0);
  };

  // 재료 기반 레시피 찾기
  const findRecipeByIngredients = (userIngredients: string[], choices: UserChoices) => {
    // 레시피 데이터베이스
    const recipeDatabase = [
      // 밥 요리
      {
        name: '김치볶음밥',
        style: '한식',
        required: ['밥', '김치'],
        optional: ['계란', '대파', '참기름', '식용유'],
        cooking: ['볶음'],
        difficulty: '⭐ 쉬움',
        time: '10-15분',
        steps: [
          '1. 김치를 작게 썰어주세요.',
          '2. 팬에 식용유를 두르고 김치를 먼저 볶습니다.',
          '3. 김치가 익으면 밥을 넣고 같이 볶아주세요.',
          '4. 대파를 넣고 참기름으로 마무리합니다.',
          '5. 계란 프라이를 올려 완성! ✨'
        ]
      },
      {
        name: '간장계란밥',
        style: '한식',
        required: ['밥', '계란'],
        optional: ['간장', '참기름', '대파', '깨'],
        cooking: ['끓임', '볶음'],
        difficulty: '⭐ 쉬움',
        time: '5분',
        steps: [
          '1. 뜨거운 밥을 그릇에 담습니다.',
          '2. 계란을 밥 위에 올리고 풀어줍니다.',
          '3. 간장 1큰술을 넣어주세요.',
          '4. 참기름과 깨를 뿌립니다.',
          '5. 잘 비벼서 드세요! ✨'
        ]
      },
      {
        name: '계란볶음밥',
        style: '중식',
        required: ['밥', '계란'],
        optional: ['대파', '당근', '양파', '간장', '식용유'],
        cooking: ['볶음'],
        difficulty: '⭐ 쉬움',
        time: '10분',
        steps: [
          '1. 계란을 풀어서 스크램블을 만듭니다.',
          '2. 대파, 당근, 양파를 잘게 썰어주세요.',
          '3. 팬에 식용유를 두르고 야채를 볶습니다.',
          '4. 밥과 계란을 넣고 센 불에서 볶습니다.',
          '5. 간장으로 간을 맞춰 완성! ✨'
        ]
      },
      // 라면 요리
      {
        name: '계란라면',
        style: '분식',
        required: ['라면', '계란'],
        optional: ['대파', '김치'],
        cooking: ['끓임'],
        difficulty: '⭐ 쉬움',
        time: '5-10분',
        steps: [
          '1. 물 550ml를 끓입니다.',
          '2. 라면과 스프를 넣고 끓입니다.',
          '3. 계란을 넣어주세요.',
          '4. 대파를 송송 썰어 넣습니다.',
          '5. 3분 정도 끓여서 완성! ✨'
        ]
      },
      // 계란 요리
      {
        name: '계란말이',
        style: '한식',
        required: ['계란'],
        optional: ['대파', '당근', '햄', '소금', '식용유'],
        cooking: ['구이', '볶음'],
        difficulty: '⭐⭐ 보통',
        time: '10-15분',
        steps: [
          '1. 계란을 풀고 소금으로 간합니다.',
          '2. 대파, 당근, 햄을 잘게 썰어 넣습니다.',
          '3. 팬에 식용유를 두르고 계란물을 부어줍니다.',
          '4. 반쯤 익으면 돌돌 말아줍니다.',
          '5. 노릇하게 구워서 완성! ✨'
        ]
      },
      {
        name: '계란찜',
        style: '한식',
        required: ['계란'],
        optional: ['물', '소금', '대파'],
        cooking: ['찜'],
        difficulty: '⭐ 쉬움',
        time: '10분',
        steps: [
          '1. 계란 3개를 풀어줍니다.',
          '2. 물 반 컵을 넣고 소금으로 간합니다.',
          '3. 잘 섞어서 체에 거릅니다.',
          '4. 용기에 담아 전자레인지 3분 돌립니다.',
          '5. 대파를 뿌려 완성! ✨'
        ]
      },
      // 면 요리
      {
        name: '간단 파스타',
        style: '양식',
        required: ['파스타면'],
        optional: ['토마토소스', '올리브유', '마늘', '양파'],
        cooking: ['끓임', '볶음'],
        difficulty: '⭐⭐ 보통',
        time: '15-20분',
        steps: [
          '1. 물을 끓여 파스타면을 삶습니다.',
          '2. 마늘과 양파를 잘게 썰어줍니다.',
          '3. 올리브유에 마늘과 양파를 볶습니다.',
          '4. 토마토소스를 넣고 졸입니다.',
          '5. 삶은 면을 넣고 볶아 완성! ✨'
        ]
      },
      // 간단 요리
      {
        name: '참치마요덮밥',
        style: '일식',
        required: ['밥', '참치캔'],
        optional: ['마요네즈', '김', '깨'],
        cooking: ['무침'],
        difficulty: '⭐ 쉬움',
        time: '5분',
        steps: [
          '1. 참치캔의 기름을 따라냅니다.',
          '2. 참치와 마요네즈를 섞어줍니다.',
          '3. 밥 위에 참치마요를 올립니다.',
          '4. 김과 깨를 뿌립니다.',
          '5. 바로 드세요! ✨'
        ]
      },
      {
        name: '두부조림',
        style: '한식',
        required: ['두부'],
        optional: ['간장', '설탕', '대파', '마늘', '참기름'],
        cooking: ['조림', '구이'],
        difficulty: '⭐⭐ 보통',
        time: '15-20분',
        steps: [
          '1. 두부를 먹기 좋은 크기로 썰어줍니다.',
          '2. 팬에 두부를 노릇하게 구워줍니다.',
          '3. 간장, 설탕, 물을 섞어 양념장을 만듭니다.',
          '4. 양념장을 붓고 조려줍니다.',
          '5. 대파와 참기름을 넣어 완성! ✨'
        ]
      }
    ];

    // 사용자 재료와 매칭되는 레시피 찾기
    let bestMatch = null;
    let highestScore = 0;

    for (const recipe of recipeDatabase) {
      // 스타일 필터링
      if (choices.style && recipe.style !== choices.style && choices.style !== '기타') {
        continue;
      }

      // 조리방식 필터링
      if (choices.cooking && choices.cooking !== '상관없음') {
        if (!recipe.cooking.some(method => 
          choices.cooking?.includes(method) || method.includes(choices.cooking || '')
        )) {
          continue;
        }
      }

      // 재료 매칭 점수 계산
      const requiredMatch = recipe.required.every(ingredient =>
        userIngredients.some(userIng => 
          userIng.includes(ingredient) || ingredient.includes(userIng)
        )
      );

      if (!requiredMatch) continue;

      const optionalMatches = recipe.optional.filter(ingredient =>
        userIngredients.some(userIng => 
          userIng.includes(ingredient) || ingredient.includes(userIng)
        )
      ).length;

      const score = (recipe.required.length * 10) + optionalMatches;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = recipe;
      }
    }

    // 매칭되는 레시피가 없으면 기본 레시피
    if (!bestMatch) {
      bestMatch = {
        name: '재료 활용 요리',
        style: choices.style || '한식',
        required: userIngredients,
        optional: [],
        cooking: [choices.cooking || '볶음'],
        difficulty: '⭐⭐ 보통',
        time: choices.time || '15-20분',
        steps: [
          '1. 모든 재료를 깨끗이 씻어 준비합니다.',
          '2. 재료를 적당한 크기로 썰어주세요.',
          '3. 팬에 식용유를 두르고 재료를 볶습니다.',
          '4. 소금, 간장 등으로 간을 맞춥니다.',
          '5. 접시에 담아 완성! ✨'
        ]
      };
    }

    // 부족한 재료 확인
    const missingIngredients = bestMatch.required.filter(ingredient =>
      !userIngredients.some(userIng => 
        userIng.includes(ingredient) || ingredient.includes(userIng)
      )
    );

    const availableOptional = bestMatch.optional.filter(ingredient =>
      userIngredients.some(userIng => 
        userIng.includes(ingredient) || ingredient.includes(userIng)
      )
    );

    // 재료 리스트 생성
    const ingredientsList: string[] = [];
    bestMatch.required.forEach(ing => {
      const hasIt = userIngredients.some(userIng => 
        userIng.includes(ing) || ing.includes(userIng)
      );
      ingredientsList.push(`• ${ing} ${hasIt ? '✅' : '❌ (필요)'}`);
    });

    availableOptional.forEach(ing => {
      ingredientsList.push(`• ${ing} ✅`);
    });

    // 추가 정보
    let additionalInfo = '';
    if (missingIngredients.length > 0) {
      additionalInfo = `⚠️ 부족한 필수 재료: ${missingIngredients.join(', ')}\n이 재료들이 있으면 더욱 맛있게 만들 수 있어요!`;
    } else {
      additionalInfo = '✅ 가지고 계신 재료로 충분히 만들 수 있어요!';
    }

    return {
      name: bestMatch.name,
      difficulty: bestMatch.difficulty,
      time: bestMatch.time || choices.time || '15-20분',
      servings: '1인분',
      ingredients: ingredientsList,
      steps: bestMatch.steps,
      additionalInfo
    };
  };

  const getMockRecipeName = (choices: UserChoices): string => {
    const recipes: Record<string, string[]> = {
      '한식': ['김치볶음밥', '된장찌개', '계란말이', '간장계란밥'],
      '양식': ['토마토 파스타', '크림 스파게티', '오믈렛', '그릴 샌드위치'],
      '중식': ['볶음밥', '짜장면', '짬뽕', '마파두부'],
      '일식': ['규동', '오야코동', '우동', '덮밥'],
    };
    const styleRecipes = recipes[choices.style || '한식'] || recipes['한식'];
    return styleRecipes[Math.floor(Math.random() * styleRecipes.length)];
  };

  const getMockIngredients = (choices: UserChoices): string[] => {
    return [
      '• ' + (choices.ingredients || '밥, 계란, 김치'),
      '• 식용유 1큰술',
      '• 간장 1작은술',
      '• 참기름 약간',
      '• 깨 약간'
    ];
  };

  const getMockSteps = (choices: UserChoices): string[] => {
    return [
      '1. 모든 재료를 준비합니다.',
      '2. 팬에 식용유를 두르고 중불로 예열합니다.',
      '3. 주재료를 넣고 ' + (choices.cooking || '볶습니다') + '.',
      '4. 간을 맞추고 접시에 담아냅니다.',
      '5. 마지막으로 참기름과 깨를 뿌려 완성합니다! ✨'
    ];
  };

  const currentQuestion = step !== 'result' ? questions[step as keyof typeof questions] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-orange-500" />
            <h1 className="text-lg font-bold">AI 요리 추천</h1>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.type === 'user'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100'
              }`}
            >
              {msg.type === 'bot' && (
                <Sparkles className="w-4 h-4 text-orange-500 inline-block mr-2" />
              )}
              <span className="whitespace-pre-line">{msg.content}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      {step !== 'result' && (
        <div className="bg-white border-t border-gray-200 sticky bottom-16 max-w-md mx-auto w-full">
          <div className="p-4 space-y-3">
            {currentQuestion && !currentQuestion.freeInput ? (
              <div className="grid grid-cols-2 gap-2">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleChoice(option)}
                    className="bg-orange-50 text-orange-600 font-medium py-3 px-4 rounded-xl hover:bg-orange-100 transition-colors border border-orange-200"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : currentQuestion?.freeInput && step === 'ingredients' ? (
              <div className="space-y-3">
                {/* 추천 식재료 버튼 */}
                {userChoices.style && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium">추천 식재료 (탭하여 선택)</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendedIngredients[userChoices.style]?.map((ingredient) => (
                        <button
                          key={ingredient}
                          onClick={() => handleIngredientToggle(ingredient)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            selectedIngredients.includes(ingredient)
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {ingredient} {selectedIngredients.includes(ingredient) ? '✓' : '+'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 선택된 식재료 표시 */}
                {selectedIngredients.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600 font-medium mb-2">선택된 식재료 ({selectedIngredients.length}개)</p>
                    <p className="text-sm text-orange-800">{selectedIngredients.join(', ')}</p>
                  </div>
                )}
                
                {/* 입력창 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleFreeInput()}
                    placeholder="추가 재료 입력 (선택사항)"
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={handleFreeInput}
                    className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : currentQuestion?.freeInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFreeInput()}
                  placeholder="예: 밥, 계란, 김치, 대파..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={handleFreeInput}
                  className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {step === 'result' && (
        <div className="bg-white border-t border-gray-200 sticky bottom-16 max-w-md mx-auto w-full">
          <div className="p-4 flex gap-2">
            <button
              onClick={() => {
                if (currentRecipe) {
                  // 로컬 스토리지에서 기존 레시피 가져오기
                  const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
                  // 새 레시피 추가
                  savedRecipes.push(currentRecipe);
                  // 로컬 스토리지에 저장
                  localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
                  alert('레시피가 저장되었습니다! 📝\n채팅 메뉴에서 확인할 수 있습니다.');
                }
                navigate('/');
              }}
              className="flex-1 bg-orange-500 text-white font-medium py-3 px-4 rounded-xl hover:bg-orange-600 transition-colors"
            >
              저장하기
            </button>
            <button
              onClick={() => {
                setStep('purpose');
                setMessages([
                  { type: 'bot', content: '안녕하세요! 🍳 오늘 어떤 음식을 만들고 싶으신가요?' },
                  { type: 'bot', content: '먼저 목적을 선택해주세요!' }
                ]);
                setUserChoices({});
                setCurrentRecipe(null);
              }}
              className="flex-1 bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
            >
              새로 시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
}