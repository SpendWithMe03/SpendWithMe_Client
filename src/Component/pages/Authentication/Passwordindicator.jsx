

const PasswordStrengthBar = ({ password }) => {
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, message: "" };
    
    let score = 0;
    let checks = {
      length: pwd.length >= 8,
      hasNumber: /\d/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasUpperCase: /[A-Z]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    // Add points for each criteria met
    if (checks.length) score += 1;
    if (checks.hasNumber) score += 1;
    if (checks.hasLowerCase) score += 1;
    if (checks.hasUpperCase) score += 1;
    if (checks.hasSpecial) score += 1;

    // Determine message based on score
    const messages = [
      "Very weak",
      "Weak",
      "Fair",
      "Good",
      "Strong",
      "Very strong"
    ];

    return {
      score,
      message: messages[score],
      checks
    };
  };

  const strength = calculateStrength(password);
  const strengthPercent = (strength.score / 5) * 100;

  const getBarColor = (score) => {
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-green-500";
    return "bg-emerald-500";
  };

  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getBarColor(strength.score)} transition-all duration-300`}
          style={{ width: `${strengthPercent}%` }}
        />
      </div>
      {password && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            Password strength: <span className="font-medium">{strength.message}</span>
          </p>
          
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthBar;